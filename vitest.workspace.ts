import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    plugins: [tsconfigPaths()],
    assetsInclude: ["./shared/doc/**/*.md"],
    test: {
      name: "server",
      root: "./server",
      include: ["./tests/**/*.test.ts", "./src/**/*.test.ts"],
      setupFiles: ["./tests/setup.ts"],
      globalSetup: ["./server/tests/globalSetup.ts"],
      // threads: true,
      clearMocks: true,
      sequence: {
        // Important for useMongo to be sequential
        hooks: "stack",
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./server/src"),
      },
    },
  },
  {
    plugins: [tsconfigPaths()],
    assetsInclude: ["./shared/doc/**/*.md"],
    test: {
      name: "ui",
      root: "./ui",
      include: ["./**/*.test.ts"],
      setupFiles: ["./tests/setup.ts"],
      clearMocks: true,
    },
  },
  {
    plugins: [tsconfigPaths()],
    assetsInclude: ["./shared/doc/**/*.md"],
    test: {
      name: "shared",
      root: "./shared",
      include: ["**/*.test.ts"],
      clearMocks: true,
    },
  },
  {
    test: {
      name: "sdk",
      root: "./sdk",
      include: ["**/*.test.ts"],
      clearMocks: true,
    },
  },
]);
