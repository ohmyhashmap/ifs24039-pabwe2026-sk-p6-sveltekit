<script lang="ts">
  import Modal from "../../../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { createCourse } from "../states/coursesStore";

  let { onclose }: { onclose: () => void } = $props();

  const { value: title } = useInput();
  const { value: description } = useInput();
  let saving = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    const ok = await createCourse({ title: $title.trim(), description: $description.trim() });
    saving = false;
    if (ok) onclose();
  }
</script>

<Modal title="Tambah kursus" {onclose}>
  <form class="space-y-4" onsubmit={submit}>
    <label class="block text-sm font-medium">
      Judul
      <input required bind:value={$title} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <label class="block text-sm font-medium">
      Deskripsi
      <textarea required rows="4" bind:value={$description} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5"></textarea>
    </label>
    <p class="text-xs text-ink-500">Sampul dapat diunggah dari halaman detail setelah kursus dibuat.</p>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-xl px-4 py-2 text-sm hover:bg-ink-100" onclick={onclose}>Batal</button>
      <button disabled={saving} class="rounded-xl bg-ink-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60">
        {saving ? "Menyimpan..." : "Simpan kursus"}
      </button>
    </div>
  </form>
</Modal>
