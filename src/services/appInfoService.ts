import Constants from "expo-constants";
import * as Application from "expo-application";
import { Linking } from "react-native";

export interface AppBuildInfo {
  appName: string;
  version: string;
  nativeBuildVersion: string;
  packageName: string;
  gitCommitHash: string;
  gitCommitShort: string;
  gitCommitDate: string;
  gitBranch: string;
  firebaseProjectId: string;
  distributionChannel: string;
  repositoryUrl: string;
}

export function getAppBuildInfo(): AppBuildInfo {
  const expoConfig = Constants.expoConfig;
  const extra = (expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  const gitCommitHash =
    extra.gitCommitHash || process.env.EXPO_PUBLIC_GIT_COMMIT || "indisponível";
  const gitCommitShort =
    extra.gitCommitShort ||
    process.env.EXPO_PUBLIC_GIT_COMMIT_SHORT ||
    (gitCommitHash !== "indisponível" ? gitCommitHash.slice(0, 7) : "indisponível");

  return {
    appName: Application.applicationName || expoConfig?.name || "PetTrack",
    version: Application.nativeApplicationVersion || expoConfig?.version || "1.0.0",
    nativeBuildVersion:
      Application.nativeBuildVersion || String(expoConfig?.android?.versionCode ?? 1),
    packageName:
      Application.applicationId || expoConfig?.android?.package || "com.pettrack.app",
    gitCommitHash,
    gitCommitShort,
    gitCommitDate: extra.gitCommitDate || process.env.EXPO_PUBLIC_GIT_COMMIT_DATE || "",
    gitBranch: extra.gitBranch || process.env.EXPO_PUBLIC_GIT_BRANCH || "main",
    firebaseProjectId: extra.firebaseProjectId || "pettrack-20299",
    distributionChannel: extra.distributionChannel || "Firebase App Distribution",
    repositoryUrl:
      extra.repositoryUrl ||
      "https://github.com/Challenge-PetTrack/MOBILE-APPLICATION-DEVELOPMENT-TUTOR",
  };
}

export async function openRepositoryUrl(): Promise<void> {
  const { repositoryUrl } = getAppBuildInfo();
  if (await Linking.canOpenURL(repositoryUrl)) {
    await Linking.openURL(repositoryUrl);
  }
}
