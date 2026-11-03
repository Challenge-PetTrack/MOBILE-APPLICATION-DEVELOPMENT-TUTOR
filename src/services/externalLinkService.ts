import { Linking } from "react-native";
import { onlyDigits } from "@/utils/validation";

/** Abre conversa no WhatsApp com número brasileiro (adiciona DDI 55 se necessário). */
export async function openWhatsApp(phone: string, text?: string): Promise<boolean> {
  const digits = onlyDigits(phone);
  if (!digits) return false;

  const fullPhone = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  const url = `https://wa.me/${fullPhone}${query}`;

  const supported = await Linking.canOpenURL(url);
  if (!supported) return false;
  await Linking.openURL(url);
  return true;
}
