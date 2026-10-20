import { sveltekit } from "@sveltejs/kit/vite";
import bunAdapter from "@sveltejs/adapter-bun";
import vercelAdapter from "@sveltejs/adapter-vercel";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig, loadEnv } from "vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(process.env.APP_PORT || env.APP_PORT) || 3005;

  // Vercel mengisi variabel VERCEL saat build, Jenkins tidak.
  const isVercel = Boolean(process.env.VERCEL);

  return {
    plugins: [
      sveltekit({
        adapter: isVercel
          ? vercelAdapter()
          : bunAdapter({
              envPrefix: "SVELTEKIT_",
              serverOptions: {
                port: port,
              },
            }),
        inlineStyleThreshold: 20000,
      }),
      tailwindcss(),
      svelteTesting(),
    ],

    // ============================================================
    // PENTING: prioritaskan .ts di atas .js
    // Mencegah file .js stale (sisa deploy lama) menutupi file .ts
    // yang baru, sehingga error MISSING_EXPORT tidak terulang.
    // ============================================================
    resolve: {
      extensions: [".mts", ".ts", ".mjs", ".js", ".jsx", ".tsx", ".json"],
    },

    server: {
      port: port,
    },
    preview: {
      port: port,
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
      include: ["src/tests/**/*.{test,spec}.{js,ts}", "src/App.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: [
          "src/components/**/*.svelte",
          "src/features/auth/api/*.ts",
          "src/features/auth/components/*.svelte",
          "src/features/auth/layouts/AuthLayout.svelte",
          "src/features/auth/pages/*.svelte",
          "src/features/auth/states/*.ts",
          "src/features/courses/api/*.ts",
          "src/features/courses/components/{AddModal,ChangeCoverModal,ChangeModal,ContentModal,CourseCard}.svelte",
          "src/features/courses/layouts/CourseLayout.svelte",
          "src/features/courses/pages/*.svelte",
          "src/features/courses/states/*.ts",
          "src/features/users/api/*.ts",
          "src/features/users/pages/*.svelte",
          "src/features/users/states/*.ts",
          "src/helpers/*.ts",
          "src/hooks/*.ts",
          "src/routes/**/*.svelte",
          "src/routes/**/*.ts",
          "src/states/*.ts",
          "src/pageState.svelte.ts",
          "src/tests/utils.ts",
        ],
        exclude: [
          "node_modules/",
          "**/*.test.ts",
          "src/setupTests.ts",
          "src/test-utils.ts",
          "src/routes/**/+error.svelte",
          "**/*.d.ts",
        ],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  };
});