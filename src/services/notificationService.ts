import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { preferencesStorage } from "./preferencesStorage";
import { VACINAS_NOMES, CATALOGO_CUIDADOS } from "@/constants/catalogos";
import { formatDateTime, minutesToTime, timeToMinutes } from "@/utils/date";
import type {
  Consulta,
  ConsultaStatus,
  CuidadoPreventivo,
  Medicamento,
  VacinaRegistro,
} from "@/types/models";

export const CHANNEL_LEMBRETES = "pettrack-lembretes";
export const CHANNEL_CONSULTAS = "pettrack-consultas";

/** Payload anexado em `notification.request.content.data` para roteamento ao tocar na notificação. */
export interface NotificationRouteData {
  route:
    | "/tutor/medicamentos"
    | "/tutor/vacinas"
    | "/tutor/agendar-consulta"
    | "/vet/agenda";
  params?: Record<string, string>;
}

const isNative = Platform.OS === "android" || Platform.OS === "ios";
let handlerConfigured = false;

export function configureNotificationHandler() {
  if (!isNative || handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function initializeNotifications(): Promise<boolean> {
  if (!isNative) return false;
  configureNotificationHandler();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_LEMBRETES, {
      name: "Lembretes de Saúde do Pet",
      description: "Horários de medicamentos, vacinas e cuidados preventivos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: "#4f46e5",
    });

    await Notifications.setNotificationChannelAsync(CHANNEL_CONSULTAS, {
      name: "Atualizações de Consultas",
      description: "Novos agendamentos, confirmações e prontuários liberados",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 150, 300],
      lightColor: "#0d9488",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function canSendNotification(): Promise<boolean> {
  if (!isNative) return false;
  const enabled = await preferencesStorage.getNotificationsEnabled();
  if (!enabled) return false;
  return initializeNotifications();
}

/** Calcula todos os horários do dia (HH:MM) a partir do horário inicial e da frequência em horas. */
export function computeDoseSchedule(horarioInicial: string, frequenciaHoras: number): string[] {
  const step = Math.max(1, frequenciaHoras) * 60;
  const start = timeToMinutes(horarioInicial);
  const count = Math.max(1, Math.floor(1440 / step));
  return Array.from({ length: count }, (_, i) => minutesToTime(start + i * step)).sort();
}

const medIdentifier = (medId: string, slotIndex: number) => `med-${medId}-${slotIndex}`;
const vacinaIdentifier = (petId: string, vacinaId: string) => `vacina-${petId}-${vacinaId}`;
const cuidadoIdentifier = (petId: string, tipo: string) => `cuidado-${petId}-${tipo}`;
const consultaReminderIdentifier = (consultaId: string) => `consulta-lembrete-${consultaId}`;

export const notificationService = {
  /** Agenda lembretes diários para cada dose de um tratamento ativo. */
  async scheduleMedicamento(med: Medicamento): Promise<void> {
    await this.cancelMedicamento(med.id);
    if (!med.ativo || !(await canSendNotification())) return;

    const horarios = computeDoseSchedule(med.horarioInicial, med.frequenciaHoras);
    const data: NotificationRouteData = {
      route: "/tutor/medicamentos",
      params: { petId: med.petId, medId: med.id },
    };

    await Promise.all(
      horarios.map((hhmm, idx) => {
        const [hour, minute] = hhmm.split(":").map(Number);
        return Notifications.scheduleNotificationAsync({
          identifier: medIdentifier(med.id, idx),
          content: {
            title: `Hora do medicamento de ${med.petNome}`,
            body: `Administrar ${med.nome} (${med.dosagem}) — dose das ${hhmm}. Toque para registrar.`,
            sound: true,
            data: data as unknown as Record<string, unknown>,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: CHANNEL_LEMBRETES,
          },
        });
      })
    );
  },

  async cancelMedicamento(medId: string): Promise<void> {
    if (!isNative) return;
    await Promise.all(
      Array.from({ length: 6 }, (_, idx) =>
        Notifications.cancelScheduledNotificationAsync(medIdentifier(medId, idx)).catch(() => {})
      )
    );
  },

  /** Agenda lembrete de reforço na data da próxima dose da vacina (às 09:00). */
  async scheduleVacinaBooster(vacina: VacinaRegistro): Promise<void> {
    const id = vacinaIdentifier(vacina.petId, vacina.vacinaId);
    if (!isNative) return;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

    if (!vacina.tomada || !vacina.proximaDose || !(await canSendNotification())) return;

    const target = new Date(vacina.proximaDose);
    target.setHours(9, 0, 0, 0);
    if (target.getTime() <= Date.now()) return;

    const nomeVacina = VACINAS_NOMES[vacina.vacinaId] ?? vacina.vacinaId;
    const data: NotificationRouteData = {
      route: "/tutor/vacinas",
      params: { petId: vacina.petId },
    };

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `Reforço de vacina de ${vacina.petNome}`,
        body: `Chegou a data de reforço da vacina ${nomeVacina}. Confira a carteira de vacinação.`,
        sound: true,
        data: data as unknown as Record<string, unknown>,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
        channelId: CHANNEL_LEMBRETES,
      },
    });
  },

  /** Agenda lembrete para a próxima aplicação de um cuidado preventivo (às 09:00). */
  async scheduleCuidadoPreventivo(cuidado: CuidadoPreventivo): Promise<void> {
    const id = cuidadoIdentifier(cuidado.petId, cuidado.tipo);
    if (!isNative) return;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

    if (!(await canSendNotification())) return;

    const target = new Date(cuidado.proximaAplicacao);
    target.setHours(9, 0, 0, 0);
    if (target.getTime() <= Date.now()) return;

    const catalogo = CATALOGO_CUIDADOS.find((c) => c.id === cuidado.tipo);
    const nomeCuidado = catalogo?.nome ?? cuidado.tipo;
    const data: NotificationRouteData = {
      route: "/tutor/medicamentos",
      params: { petId: cuidado.petId, tab: "preventivos" },
    };

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `Cuidado preventivo de ${cuidado.petNome}`,
        body: `Hoje é dia de renovar: ${nomeCuidado}. Toque para registrar a aplicação.`,
        sound: true,
        data: data as unknown as Record<string, unknown>,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
        channelId: CHANNEL_LEMBRETES,
      },
    });
  },

  /** Agenda lembrete automático 1 hora antes da consulta (ou no horário exato se faltar menos de 1h). */
  async scheduleConsultaReminder(consulta: Consulta): Promise<void> {
    const id = consultaReminderIdentifier(consulta.id);
    if (!isNative) return;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

    if (
      consulta.status === "cancelada" ||
      consulta.status === "concluida" ||
      !(await canSendNotification())
    ) {
      return;
    }

    const consultaDate = new Date(consulta.dataHora);
    const oneHourBefore = new Date(consultaDate.getTime() - 60 * 60 * 1000);
    const triggerDate = oneHourBefore.getTime() > Date.now() ? oneHourBefore : consultaDate;
    if (triggerDate.getTime() <= Date.now()) return;

    const data: NotificationRouteData = {
      route: "/tutor/agendar-consulta",
      params: { consultaId: consulta.id },
    };

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: `Lembrete de consulta • ${consulta.petNome}`,
        body: `Atendimento marcado para ${formatDateTime(consulta.dataHora)} (${consulta.motivo}).`,
        sound: true,
        data: data as unknown as Record<string, unknown>,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: CHANNEL_CONSULTAS,
      },
    });
  },

  async cancelConsultaReminder(consultaId: string): Promise<void> {
    if (!isNative) return;
    await Notifications.cancelScheduledNotificationAsync(
      consultaReminderIdentifier(consultaId)
    ).catch(() => {});
  },

  /**
   * Notificação automática para o Tutor quando o Veterinário altera o status
   * ou libera o prontuário da consulta no Firestore.
   */
  async notifyTutorConsultaUpdate(consulta: Consulta, novoStatus: ConsultaStatus): Promise<void> {
    if (!(await canSendNotification())) return;

    const messages: Record<Exclude<ConsultaStatus, "pendente">, { title: string; body: string }> = {
      confirmada: {
        title: `Consulta confirmada • ${consulta.petNome}`,
        body: `O veterinário confirmou o atendimento em ${formatDateTime(consulta.dataHora)}. Toque para ver os detalhes.`,
      },
      concluida: {
        title: `Prontuário disponível • ${consulta.petNome}`,
        body: `A consulta de ${consulta.petNome} foi concluída. Toque para conferir o diagnóstico e baixar a receita em PDF.`,
      },
      cancelada: {
        title: `Consulta cancelada • ${consulta.petNome}`,
        body: `O agendamento de ${formatDateTime(consulta.dataHora)} foi cancelado. Toque para reagendar se necessário.`,
      },
    };

    if (novoStatus === "pendente") return;
    const message = messages[novoStatus];
    const data: NotificationRouteData = {
      route: "/tutor/agendar-consulta",
      params: { consultaId: consulta.id },
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        data: data as unknown as Record<string, unknown>,
      },
      trigger: Platform.OS === "android" ? { channelId: CHANNEL_CONSULTAS } : null,
    });
  },

  /**
   * Notificação automática para o Veterinário quando um Tutor solicita
   * um novo agendamento no Firestore.
   */
  async notifyVetNovaConsulta(consulta: Consulta): Promise<void> {
    if (!(await canSendNotification())) return;

    const data: NotificationRouteData = {
      route: "/vet/agenda",
      params: { consultaId: consulta.id, data: consulta.dataHora },
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Nova consulta solicitada • ${consulta.petNome}`,
        body: `${consulta.tutorNome} solicitou atendimento para ${formatDateTime(consulta.dataHora)} (${consulta.motivo}).`,
        sound: true,
        data: data as unknown as Record<string, unknown>,
      },
      trigger: Platform.OS === "android" ? { channelId: CHANNEL_CONSULTAS } : null,
    });
  },

  async listScheduledCount(): Promise<number> {
    if (!isNative) return 0;
    const list = await Notifications.getAllScheduledNotificationsAsync();
    return list.length;
  },

  async cancelAll(): Promise<void> {
    if (!isNative) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
