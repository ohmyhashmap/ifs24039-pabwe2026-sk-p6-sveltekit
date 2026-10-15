<script lang="ts">
  import { X } from "lucide-svelte";
  import { dismiss, toasts } from "../states/toastStore";

  const tone = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    error: "border-red-300 bg-red-50 text-red-900",
    info: "border-ink-200 bg-white text-ink-900",
  };
</script>

<div
  class="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
  aria-live="polite"
>
  {#each $toasts as toast (toast.id)}
    <div
      role="status"
      class={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${tone[toast.type]}`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        class="shrink-0 opacity-60 hover:opacity-100"
        aria-label="Tutup notifikasi"
        onclick={() => dismiss(toast.id)}
      >
        <X size={16} />
      </button>
    </div>
  {/each}
</div>
