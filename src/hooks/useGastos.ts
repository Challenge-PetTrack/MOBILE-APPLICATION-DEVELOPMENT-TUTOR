import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { gastoService } from "@/services/gastoService";
import { CATEGORIAS_GASTO } from "@/constants/catalogos";

export function useTutorGastos() {
  const { user } = useAuth();
  const queryResult = useQuery({
    queryKey: ["gastos", user?.uid],
    queryFn: () => gastoService.listByTutor(user!.uid),
    enabled: !!user?.uid,
  });

  const summary = useMemo(() => {
    const gastos = queryResult.data ?? [];
    const total = gastos.reduce((acc, g) => acc + g.valor, 0);
    const porCategoria = CATEGORIAS_GASTO.map((cat) => {
      const subtotal = gastos
        .filter((g) => g.categoria === cat.id)
        .reduce((acc, g) => acc + g.valor, 0);
      return {
        ...cat,
        subtotal,
        percentual: total > 0 ? Math.round((subtotal / total) * 100) : 0,
      };
    }).filter((c) => c.subtotal > 0);

    return { total, porCategoria };
  }, [queryResult.data]);

  return { ...queryResult, gastos: queryResult.data ?? [], ...summary };
}

export function useCreateGasto() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (fields: { categoria: string; descricao: string; valor: number }) => {
      if (!user) throw new Error("Sessão inválida.");
      return gastoService.create({
        tutorId: user.uid,
        categoria: fields.categoria,
        descricao: fields.descricao.trim(),
        valor: fields.valor,
        data: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}

export function useDeleteGasto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gastoService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gastos"] });
    },
  });
}
