import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

/**
 * Gera um PDF a partir de um HTML e abre a folha de compartilhamento do sistema.
 * Os templates (RG do pet, receituário etc.) ficam em src/services/documents.
 */
export async function shareHtmlAsPdf(html: string, dialogTitle: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf", dialogTitle });
  } else {
    await Print.printAsync({ uri });
  }
}

/** Escapa texto digitado pelo usuário antes de interpolar em templates HTML. */
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
