<script lang="ts">
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let {
    title,
    onclose,
    children,
  }: { title: string; onclose: () => void; children: Snippet } = $props();

  const uid = $props.id();
</script>

<svelte:window onkeydown={(event) => event.key === "Escape" && onclose()} />

<div
  class="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-4 sm:items-center"
  role="presentation"
  data-testid="modal-backdrop"
  onclick={(event) => {
    if (event.target === event.currentTarget) onclose();
  }}
>
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="{uid}-title"
    class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <h2 id="{uid}-title" class="text-lg font-bold text-ink-900">{title}</h2>
      <button
        type="button"
        class="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
        aria-label="Tutup"
        onclick={onclose}
      >
        <X size={18} />
      </button>
    </div>
    {@render children()}
  </div>
</div>
