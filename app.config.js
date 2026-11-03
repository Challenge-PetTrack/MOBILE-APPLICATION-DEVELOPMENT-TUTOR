const { execSync } = require("child_process");

function readGit(command, fallback = "indisponível") {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

/**
 * Injeta metadados de versão e o hash exato do commit Git no bundle em tempo de build,
 * garantindo correspondência entre o APK publicado no Firebase App Distribution,
 * a tela "Sobre o App" e o código-fonte entregue no GitHub.
 */
module.exports = ({ config }) => {
  const gitCommitHash =
    process.env.EXPO_PUBLIC_GIT_COMMIT || readGit("git rev-parse HEAD");
  const gitCommitShort =
    process.env.EXPO_PUBLIC_GIT_COMMIT_SHORT ||
    (gitCommitHash !== "indisponível" ? gitCommitHash.slice(0, 7) : readGit("git rev-parse --short HEAD"));
  const gitCommitDate =
    process.env.EXPO_PUBLIC_GIT_COMMIT_DATE ||
    readGit("git log -1 --format=%cI", new Date().toISOString());
  const gitBranch =
    process.env.EXPO_PUBLIC_GIT_BRANCH ||
    readGit("git rev-parse --abbrev-ref HEAD", "main");

  process.env.EXPO_PUBLIC_GIT_COMMIT = gitCommitHash;
  process.env.EXPO_PUBLIC_GIT_COMMIT_SHORT = gitCommitShort;
  process.env.EXPO_PUBLIC_GIT_COMMIT_DATE = gitCommitDate;
  process.env.EXPO_PUBLIC_GIT_BRANCH = gitBranch;

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      gitCommitHash,
      gitCommitShort,
      gitCommitDate,
      gitBranch,
      firebaseProjectId: "pettrack-20299",
      distributionChannel: "Firebase App Distribution",
      repositoryUrl: "https://github.com/Challenge-PetTrack/MOBILE-APPLICATION-DEVELOPMENT-TUTOR",
    },
  };
};
