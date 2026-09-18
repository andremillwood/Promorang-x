#!/usr/bin/env node
/**
 * Vercel Ignored Build Step.
 *
 * Exit 0 = skip this deployment.
 * Exit 1 = build.
 *
 * Policy:
 * - the API project must never run the repo-root Vite web build;
 * - the long-running canonical design branch is quiet by default so iterative
 *   implementation does not exhaust Hobby-plan preview capacity;
 * - add [vercel-preview] to a checkpoint commit message when a fresh visual
 *   preview is intentionally required.
 */
const API_PROJECT_ID = "prj_xGi6381FZXlZcKtYLB8moaPX6dt7";
const QUIET_PREVIEW_BRANCHES = new Set([
  "design/canonical-object-system-v1",
]);
const PREVIEW_OPT_IN = "[vercel-preview]";

if (process.env.VERCEL_PROJECT_ID === API_PROJECT_ID) {
  console.log(
    "[vercel] Skipping repo-root Vite build for the api project. API deploys belong to the backend-root project.",
  );
  process.exit(0);
}

const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || "";
const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE || "";

if (QUIET_PREVIEW_BRANCHES.has(gitBranch) && !commitMessage.includes(PREVIEW_OPT_IN)) {
  console.log(
    `[vercel] Skipping preview for ${gitBranch}. Use ${PREVIEW_OPT_IN} in a deliberate checkpoint commit to opt in.`,
  );
  process.exit(0);
}

process.exit(1);
