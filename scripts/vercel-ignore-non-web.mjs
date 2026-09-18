#!/usr/bin/env node
/**
 * Vercel Ignored Build Step.
 *
 * Exit 0 = skip this deployment.
 * Exit 1 = build.
 *
 * The canonical design branch is disabled earlier at the Git integration
 * boundary through vercel.json -> git.deploymentEnabled. This script remains
 * the repo-root safety net that prevents the API project from running the web
 * Vite build if its Root Directory is ever misconfigured.
 */
const API_PROJECT_ID = "prj_xGi6381FZXlZcKtYLB8moaPX6dt7";

if (process.env.VERCEL_PROJECT_ID === API_PROJECT_ID) {
  console.log(
    "[vercel] Skipping repo-root Vite build for the api project. API deploys belong to the backend-root project.",
  );
  process.exit(0);
}

process.exit(1);
