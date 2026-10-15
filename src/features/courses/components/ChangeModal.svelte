<script lang="ts">
  import Modal from "../../../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { updateCourse } from "../states/coursesStore";
  import type { CourseDetail } from "../types";

  let { course, onclose }: { course: CourseDetail; onclose: () => void } = $props();

  // Nilai awal formulir sengaja diambil sekali saat modal dibuka.
  // svelte-ignore state_referenced_locally
  const { value: title } = useInput(course.title);
  // svelte-ignore state_referenced_locally
  const { value: description } = useInput(course.description);
  let saving = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    const ok = await updateCourse(course.id, { title: $title.trim(), description: $description.trim() });
    saving = false;
    if (ok) onclose();
  }
</script>

<Modal title="Ubah data kursus" {onclose}>
  <form class="space-y-4" onsubmit={submit}>
    <label class="block text-sm font-medium">
      Judul
      <input required bind:value={$title} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5" />
    </label>
    <label class="block text-sm font-medium">
      Deskripsi
      <textarea required rows="4" bind:value={$description} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5"></textarea>
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-xl px-4 py-2 text-sm hover:bg-ink-100" onclick={onclose}>Batal</button>
      <button disabled={saving} class="rounded-xl bg-ink-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-60">
        {saving ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </div>
  </form>
</Modal>
