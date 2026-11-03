/** Utilitários de data usados em todo o app (formato brasileiro). */

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Chave de dia no formato YYYY-MM-DD (fuso local). */
export function toDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Converte "DD/MM/AAAA" (+ "HH:MM" opcional) em Date. Retorna null se inválido. */
export function parseBrDateTime(data: string, horario = "00:00"): Date | null {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(horario.trim());
  if (!dateMatch || !timeMatch) return null;

  const [, dd, mm, yyyy] = dateMatch.map(Number);
  const [, hh, min] = timeMatch.map(Number);
  if (hh > 23 || min > 59) return null;

  const result = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  // Garante que a data existe (ex.: 31/02 seria convertido para março)
  if (result.getDate() !== dd || result.getMonth() !== mm - 1 || result.getFullYear() !== yyyy) {
    return null;
  }
  return result;
}

/** Valida "HH:MM". */
export function isValidTime(horario: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(horario.trim());
  return !!match && Number(match[1]) <= 23 && Number(match[2]) <= 59;
}

/** Converte "HH:MM" em minutos desde a meia-noite. */
export function timeToMinutes(horario: string): number {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const normalized = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Máscara de digitação para data DD/MM/AAAA. */
export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Máscara de digitação para horário HH:MM. */
export function maskTime(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

export function formatTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(iso: string | Date): string {
  return `${formatDate(iso)} às ${formatTime(iso)}`;
}

export function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatMonthYear(date: Date = new Date()): string {
  const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
