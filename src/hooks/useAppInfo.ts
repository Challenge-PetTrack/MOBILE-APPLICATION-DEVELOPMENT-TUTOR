import { useMemo } from "react";
import { getAppBuildInfo, openRepositoryUrl } from "@/services/appInfoService";

export function useAppInfo() {
  const info = useMemo(() => getAppBuildInfo(), []);
  return { info, openRepository: openRepositoryUrl };
}
