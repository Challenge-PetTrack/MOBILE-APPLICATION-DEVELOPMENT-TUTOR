import FaqListScreen from "@/components/FaqListScreen";
import { FAQS_TUTOR } from "@/constants/catalogos";

export default function TutorFaqScreen() {
  return <FaqListScreen items={FAQS_TUTOR} accentColor="#10b981" />;
}
