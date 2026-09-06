#!/usr/bin/env node
/**
 * Both GitHub-linked Vercel projects currently watch the repo root.
 * The `api` project must not run the Vite web build (it fails and
 * never updates api.promorang.co). Skip that project's Git builds
 * until its Root Directory is set to `backend`.
 *
 * Exit 0 = skip this deployment. Exit 1 = build.
 */
const API_PROJECT_ID = "prj_xGi6381FZXlZcKtYLB8moaPX6dt7";

if (process.env.VERCEL_PROJECT_ID === API_PROJECT_ID) {
  console.log(
    "[vercel] Skipping repo-root Vite build for the api project. Set Root Directory to backend so Git production deploys Express from main.",
  );
  process.exit(0);
}

process.exit(1);
