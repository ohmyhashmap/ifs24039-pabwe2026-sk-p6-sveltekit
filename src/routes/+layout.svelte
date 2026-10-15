<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import type { Snippet } from "svelte";
  import ToastHost from "../components/ToastHost.svelte";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";

  let { children }: { children: Snippet } = $props();
  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));
</script>

{#if isAuthRoute}
  {@render children()}
{:else}
  <CourseLayout>{@render children()}</CourseLayout>
{/if}

<ToastHost />
