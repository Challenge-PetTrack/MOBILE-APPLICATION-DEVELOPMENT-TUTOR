import { useCallback, useEffect, useState } from "react";
import { preferencesStorage } from "@/services/preferencesStorage";

export function useOnboarding() {
  const [isDone, setIsDone] = useState<boolean | null>(null);

  useEffect(() => {
    preferencesStorage.isOnboardingDone().then(setIsDone);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await preferencesStorage.setOnboardingDone();
    setIsDone(true);
  }, []);

  return { isDone, completeOnboarding };
}
