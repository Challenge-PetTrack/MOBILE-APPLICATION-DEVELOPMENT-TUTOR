import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { consultaService } from "@/services/consultaService";
import { medicamentoService } from "@/services/medicamentoService";
import {
  clearLastNotificationResponse,
  configureNotificationHandler,
  initializeNotifications,
  notificationService,
  observeNotificationResponses,
  type NotificationResponse,
  type NotificationRouteData,
} from "@/services/notificationService";
import { preferencesStorage } from "@/services/preferencesStorage";
import type { Consulta } from "@/types/models";

const RECENT_EVENT_WINDOW_MS = 30 * 60 * 1000;
const PREFS_QUERY_KEY = ["notification-preferences"] as const;

export function useNotificationPreferences() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const prefsQuery = useQuery({
    queryKey: PREFS_QUERY_KEY,
    queryFn: async () => {
      const [enabled, scheduledCount] = await Promise.all([
        preferencesStorage.getNotificationsEnabled(),
        notificationService.listScheduledCount(),
      ]);
      return { enabled, scheduledCount };
    },
  });

  const enabled = prefsQuery.data?.enabled ?? true;
  const scheduledCount = prefsQuery.data?.scheduledCount ?? 0;

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: PREFS_QUERY_KEY });
  }, [qc]);

  const toggleNotifications = useCallback(
    async (next: boolean) => {
      qc.setQueryData(PREFS_QUERY_KEY, {
        enabled: next,
        scheduledCount: next ? scheduledCount : 0,
      });
      await preferencesStorage.setNotificationsEnabled(next);

      if (!next) {
        await notificationService.cancelAll();
        qc.setQueryData(PREFS_QUERY_KEY, { enabled: false, scheduledCount: 0 });
        return;
      }

      await initializeNotifications();
      if (user?.perfil === "tutor") {
        const [meds, consultas] = await Promise.all([
          medicamentoService.listByTutor(user.uid),
          consultaService.listByTutor(user.uid),
        ]);
        await Promise.all([
          ...meds.filter((m) => m.ativo).map((m) => notificationService.scheduleMedicamento(m)),
          ...consultas.map((c) => notificationService.scheduleConsultaReminder(c)),
        ]);
      }
      const nextCount = await notificationService.listScheduledCount();
      qc.setQueryData(PREFS_QUERY_KEY, { enabled: true, scheduledCount: nextCount });
    },
    [qc, scheduledCount, user]
  );

  return { enabled, scheduledCount, toggleNotifications, refresh };
}

/**
 * Observador global montado no layout raiz.
 * 1. Configura canais e permissões de notificação.
 * 2. Conduz o usuário até a tela correspondente quando uma notificação é tocada.
 * 3. Escuta consultas em tempo real no Firestore e dispara notificações locais reais
 *    para o veterinário (novos agendamentos) e para o tutor (confirmação/prontuário).
 */
export function useNotificationObserver() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const handledResponsesRef = useRef<Set<string>>(new Set());

  const handleResponse = useCallback(
    (response: NotificationResponse | null | undefined) => {
      if (!response) return;
      const key = `${response.notification.request.identifier}:${response.notification.date}`;
      if (handledResponsesRef.current.has(key)) return;
      handledResponsesRef.current.add(key);

      const rawData = response.notification.request.content.data as
        | Partial<NotificationRouteData>
        | undefined;
      if (!rawData?.route || !user) return;

      const isVetRoute = rawData.route.startsWith("/vet/");
      if (isVetRoute && user.perfil !== "veterinario") return;
      if (!isVetRoute && user.perfil !== "tutor") return;

      router.push({ pathname: rawData.route as any, params: rawData.params });
      clearLastNotificationResponse().catch(() => {});
    },
    [router, user]
  );

  // Inicialização do handler em foreground e listeners de clique
  useEffect(() => {
    configureNotificationHandler();
    if (Platform.OS !== "android" && Platform.OS !== "ios") return;

    return observeNotificationResponses(handleResponse);
  }, [handleResponse]);

  // Solicita permissão ao autenticar e sincroniza consultas em tempo real
  useEffect(() => {
    if (!user) return;
    let active = true;

    initializeNotifications().catch(() => {});

    const processConsultas = async (consultas: Consulta[]) => {
      if (!active) return;

      if (user.perfil === "tutor") {
        qc.setQueryData(["consultas", "tutor", user.uid], consultas);
      } else {
        qc.setQueryData(["consultas", "clinica"], consultas);
      }

      const prevSnapshot = await preferencesStorage.getConsultaSnapshot(user.uid);
      const nextSnapshot: Record<string, string> = {};
      const now = Date.now();

      for (const c of consultas) {
        const signature = `${c.status}:${c.updatedAt || c.createdAt}`;
        nextSnapshot[c.id] = c.status;

        const prevStatus = prevSnapshot?.[c.id];
        const eventTime = Date.parse(c.updatedAt || c.createdAt || "") || 0;
        const isRecent = now - eventTime <= RECENT_EVENT_WINDOW_MS;

        if (user.perfil === "tutor") {
          const statusChanged = prevStatus !== undefined && prevStatus !== c.status;
          const updatedWhileFirstSession =
            prevSnapshot === null && c.status !== "pendente" && isRecent;

          if ((statusChanged || updatedWhileFirstSession) && c.status !== "pendente") {
            await notificationService.notifyTutorConsultaUpdate(c, c.status);
            await notificationService.scheduleConsultaReminder(c);
          }
        } else if (user.perfil === "veterinario") {
          const isNewFromTutor =
            prevStatus === undefined && c.origem === "tutor" && c.status === "pendente";
          if (isNewFromTutor && (prevSnapshot !== null || isRecent)) {
            await notificationService.notifyVetNovaConsulta(c);
          }
        }
        void signature;
      }

      await preferencesStorage.setConsultaSnapshot(user.uid, nextSnapshot);
    };

    const unsubscribe =
      user.perfil === "tutor"
        ? consultaService.subscribeByTutor(user.uid, processConsultas)
        : consultaService.subscribeAll(processConsultas);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user, qc]);
}
