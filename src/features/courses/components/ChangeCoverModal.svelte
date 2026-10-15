<script lang="ts">
  import Modal from "../../../components/Modal.svelte";
  import { changeCover } from "../states/coursesStore";

  let { courseId, onclose }: { courseId: number; onclose: () => void } = $props();

  let file = $state<File | null>(null);
  let saving = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!file) return;
    saving = true;
    const ok = await changeCover(courseId, file);
    saving = false;
    if (ok) onclose();
  }
</script>

<Modal title="Ubah sampul kursus" {onclose}>
  <form class="space-y-4" onsubmit={submit}>
    <label class="block text-sm font-medium">
      Berkas gambar
      <input
        type="file"
        accept="image/*"
        onchange={(event) => (file = event.currentTarget.files?.[0] ?? null)}
        class="mt-1 block w-full text-sm"
      />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-xl px-4 py-2 text-sm hover:bg-ink-100" onclick={onclose}>Batal</button>
      <button disabled={!file || saving} class="rounded-xl bg-ink-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60">
        {saving ? "Mengunggah..." : "Unggah sampul"}
      </button>
    </div>
  </form>
</Modal>
