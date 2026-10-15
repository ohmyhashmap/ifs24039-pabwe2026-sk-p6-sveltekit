<script lang="ts">
  import { initials, resolveAsset } from "../helpers/toolsHelper";

  let {
    name,
    src = null,
    size = "md",
  }: { name: string; src?: string | null; size?: "sm" | "md" | "lg" } = $props();

  const url = $derived(resolveAsset(src));
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-24 text-2xl" };
</script>

{#if url}
  <img src={url} alt={name} class={`rounded-full object-cover ${sizes[size]}`} />
{:else}
  <span
    class={`grid place-items-center rounded-full bg-ink-100 font-semibold text-ink-700 ${sizes[size]}`}
    role="img"
    aria-label={name}
  >
    {initials(name)}
  </span>
{/if}
