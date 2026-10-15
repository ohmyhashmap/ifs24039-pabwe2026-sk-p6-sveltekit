<script lang="ts">
  import { LogIn } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import AuthSessionRedirect from "../components/AuthSessionRedirect.svelte";
  import AuthLayout from "../layouts/AuthLayout.svelte";
  import { authStore, login } from "../states/authStore";

  const { value: email } = useInput();
  const { value: password } = useInput();

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    await login($email.trim(), $password);
  }
</script>

<AuthSessionRedirect mode="guest" />

<AuthLayout title="Masuk" subtitle="Lanjutkan belajar dari kursus terakhir Anda.">
  <form class="space-y-4" onsubmit={submit}>
    <label class="block text-sm font-medium">
      Email
      <input
        id="login-email-input"
        type="email"
        required
        autocomplete="email"
        bind:value={$email}
        class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5"
      />
    </label>
    <label class="block text-sm font-medium">
      Kata sandi
      <input
        id="login-password-input"
        type="password"
        required
        autocomplete="current-password"
        bind:value={$password}
        class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5"
      />
    </label>
    <button
      id="login-submit-button"
      type="submit"
      disabled={$authStore.loading}
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 font-semibold text-white hover:bg-ink-700 disabled:opacity-60"
    >
      <LogIn size={18} />
      {$authStore.loading ? "Memproses..." : "Masuk"}
    </button>
  </form>

  {#snippet footer()}
    Belum punya akun? <a href="/auth/register" class="font-semibold text-ink-800 underline">Daftar</a>
  {/snippet}
</AuthLayout>