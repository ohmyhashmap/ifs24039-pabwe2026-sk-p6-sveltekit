<script lang="ts">
  import { GraduationCap } from "lucide-svelte";

  let { showText = true, dark = false }: { showText?: boolean; dark?: boolean } = $props();
</script>

<span class="inline-flex items-center gap-2.5" data-testid="logo">
  <span
    class="grid size-9 place-items-center rounded-xl bg-ink-800 text-white ring-2 ring-tassel-400/70"
    aria-hidden="true"
  >
    <GraduationCap size={20} />
  </span>
  {#if showText}
    <span class="text-lg font-bold tracking-tight {dark ? 'text-white' : 'text-ink-900'}">
      Delcom Courses
    </span>
  {/if}
</span>
