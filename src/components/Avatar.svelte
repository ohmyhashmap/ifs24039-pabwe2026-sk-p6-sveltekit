<script lang="ts">
  import { initials, resolveAsset } from "../helpers/toolsHelper";

  let {
    name,
    src = null,
    size = "md",
    decorative = false,
  }: { name: string; src?: string | null; size?: "sm" | "md" | "lg"; decorative?: boolean } = $props();

  const url = $derived(resolveAsset(src));
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-24 text-2xl" };
</script>

{#if url}
  <img src={url} alt={decorative ? "" : name} class={`rounded-full object-cover ${sizes[size]}`} />
{:else}
  <span
    class={`grid place-items-center rounded-full bg-ink-100 font-semibold text-ink-700 ${sizes[size]}`}
    role="img"
    aria-label={name}
    aria-hidden={decorative}
  >
    {initials(name)}
  </span>
{/if}
