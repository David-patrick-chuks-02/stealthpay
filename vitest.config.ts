import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

function loadDotEnv() {
  const env: Record<string, string> = {};
  try {
    const text = readFileSync(path.resolve(__dirname, ".env"), "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)="([^"]*)"/);
      if (match) env[match[1]] = match[2];
    }
  } catch {
    // Tests that need the database skip themselves if DATABASE_URL is missing.
  }
  return env;
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: loadDotEnv(),
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
