/** Formata um número como moeda brasileira (R$). */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Converte texto digitado ("150,50" ou "150.50") em número. Retorna NaN se inválido. */
export function parseCurrency(value: string): number {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return parseFloat(normalized);
}
