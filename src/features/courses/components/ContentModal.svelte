<script lang="ts">
  import Modal from "../../../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { getYoutubeId } from "../../../helpers/toolsHelper";
  import { addContent, updateContent } from "../states/coursesStore";
  import type { CourseContent } from "../types";

  /** Tanpa `content` berarti mode tambah; dengan `content` berarti mode ubah. */
  let {
    courseId,
    content = null,
    onclose,
  }: { courseId: number; content?: CourseContent | null; onclose: () => void } = $props();

  // svelte-ignore state_referenced_locally
  const { value: title } = useInput(content?.title ?? "");
  // svelte-ignore state_referenced_locally
  const { value: youtube } = useInput(content?.youtube ?? "");
  let error = $state("");
  let saving = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!getYoutubeId($youtube)) {
      error = "Masukkan tautan YouTube yang valid";
      return;
    }
    error = "";
    saving = true;
    const payload = { title: $title.trim(), youtube: $youtube.trim() };
    const ok = content ? await updateContent(content.id, payload) : await addContent(courseId, payload);
    saving = false;
    if (ok) onclose();
  }
</script>

<Modal title={content ? "Ubah konten" : "Tambah konten"} {onclose}>
  <form class="space-y-4" onsubmit={submit}>
    <label class="block text-sm font-medium">
      Judul materi
      <input required bind:value={$title} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <label class="block text-sm font-medium">
      Tautan YouTube
      <input
        required
        placeholder="https://youtu.be/..."
        bind:value={$youtube}
        class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5"
      />
    </label>
    {#if error}
      <p class="text-sm text-red-700" role="alert">{error}</p>
    {/if}
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-xl px-4 py-2 text-sm hover:bg-ink-100" onclick={onclose}>Batal</button>
      <button disabled={saving} class="rounded-xl bg-ink-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60">
        {saving ? "Menyimpan..." : "Simpan konten"}
      </button>
    </div>
  </form>
</Modal>
