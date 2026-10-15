<script lang="ts">
  import { get } from "svelte/store";
  import { Camera, KeyRound, Save } from "lucide-svelte";
  import Avatar from "../../../components/Avatar.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { authStore } from "../../auth/states/authStore";
  import { savePassword, savePhoto, saveProfile } from "../states/usersStore";

  const initial = get(authStore).profile!;
  const { value: name } = useInput(initial.name);
  const { value: email } = useInput(initial.email);
  const { value: current, reset: resetCurrent } = useInput();
  const { value: next, reset: resetNext } = useInput();
  const { value: confirmation, reset: resetConfirmation } = useInput();

  let photoFile = $state<File | null>(null);
  let passwordError = $state("");
  const profile = $derived($authStore.profile);

  async function submitProfile(event: SubmitEvent) {
    event.preventDefault();
    await saveProfile($name.trim(), $email.trim());
  }

  async function submitPhoto(event: SubmitEvent) {
    event.preventDefault();
    if (photoFile && (await savePhoto(photoFile))) photoFile = null;
  }

  async function submitPassword(event: SubmitEvent) {
    event.preventDefault();
    if ($next !== $confirmation) {
      passwordError = "Konfirmasi kata sandi baru tidak sama";
      return;
    }
    passwordError = "";
    if (await savePassword($current, $next, $confirmation)) {
      resetCurrent();
      resetNext();
      resetConfirmation();
    }
  }
</script>

<section class="mx-auto max-w-2xl space-y-6">
  <h1 class="text-2xl font-bold">Profil</h1>

  <form class="space-y-4 rounded-2xl border border-ink-100 bg-white p-6" onsubmit={submitProfile}>
    <h2 class="font-semibold">Data akun</h2>
    <label class="block text-sm font-medium">
      Nama
      <input required bind:value={$name} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <label class="block text-sm font-medium">
      Email
      <input type="email" required bind:value={$email} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <button class="inline-flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700">
      <Save size={16} /> Simpan perubahan
    </button>
  </form>

  <form class="space-y-4 rounded-2xl border border-ink-100 bg-white p-6" onsubmit={submitPhoto}>
    <h2 class="font-semibold">Foto profil</h2>
    <div class="flex items-center gap-5">
      {#if profile}
        <Avatar name={profile.name} src={profile.photo} size="lg" />
      {/if}
      <input
        type="file"
        accept="image/*"
        aria-label="Berkas foto"
        onchange={(event) => (photoFile = event.currentTarget.files?.[0] ?? null)}
        class="text-sm"
      />
    </div>
    <button
      disabled={!photoFile}
      class="inline-flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-50"
    >
      <Camera size={16} /> Ganti foto
    </button>
  </form>

  <form class="space-y-4 rounded-2xl border border-ink-100 bg-white p-6" onsubmit={submitPassword}>
    <h2 class="font-semibold">Kata sandi</h2>
    <label class="block text-sm font-medium">
      Kata sandi saat ini
      <input type="password" required bind:value={$current} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <label class="block text-sm font-medium">
      Kata sandi baru
      <input type="password" required minlength="6" bind:value={$next} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <label class="block text-sm font-medium">
      Ulangi kata sandi baru
      <input type="password" required bind:value={$confirmation} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    {#if passwordError}
      <p class="text-sm text-red-700" role="alert">{passwordError}</p>
    {/if}
    <button class="inline-flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700">
      <KeyRound size={16} /> Ubah kata sandi
    </button>
  </form>
</section>
