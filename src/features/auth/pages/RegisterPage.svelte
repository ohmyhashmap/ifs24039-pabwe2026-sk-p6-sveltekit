<script lang="ts">
  import { goto } from "$app/navigation";
  import { UserPlus } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import AuthSessionRedirect from "../components/AuthSessionRedirect.svelte";
  import AuthLayout from "../layouts/AuthLayout.svelte";
  import { authStore, register } from "../states/authStore";

  const { value: name } = useInput();
  const { value: email } = useInput();
  const { value: password } = useInput();

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (await register($name.trim(), $email.trim(), $password)) {
      await goto("/auth/login");
    }
  }
</script>

<AuthSessionRedirect mode="guest" />

<AuthLayout title="Buat akun" subtitle="Daftar untuk membuat atau mengikuti kursus.">
  <form class="space-y-4" onsubmit={submit}>
    <label class="block text-sm font-medium">
      Nama
      <input
        type="text"
        required
        autocomplete="name"
        bind:value={$name}
        class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5"
      />
    </label>
    <label class="block text-sm font-medium">
      Email
      <input
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
        type="password"
        required
        minlength="6"
        autocomplete="new-password"
        bind:value={$password}
        class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5"
      />
    </label>
    <button
      type="submit"
      disabled={$authStore.loading}
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 font-semibold text-white hover:bg-ink-700 disabled:opacity-60"
    >
      <UserPlus size={18} />
      {$authStore.loading ? "Memproses..." : "Daftar"}
    </button>
  </form>

  {#snippet footer()}
    Sudah punya akun? <a href="/auth/login" class="font-semibold text-ink-800 underline">Masuk</a>
  {/snippet}
</AuthLayout>
