import FaqListScreen from "@/components/FaqListScreen";
import { FAQS_VET } from "@/constants/catalogos";

export default function VetFaqScreen() {
  return <FaqListScreen items={FAQS_VET} accentColor="#0d9488" />;
}
