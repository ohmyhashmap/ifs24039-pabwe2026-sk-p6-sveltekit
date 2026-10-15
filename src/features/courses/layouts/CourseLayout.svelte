<script lang="ts">
  import type { Snippet } from "svelte";
  import Navbar from "../../../components/Navbar.svelte";
  import Sidebar from "../../../components/Sidebar.svelte";
  import AuthSessionRedirect from "../../auth/components/AuthSessionRedirect.svelte";
  import { authStore, loadProfile } from "../../auth/states/authStore";

  let { children }: { children: Snippet } = $props();
  let menuOpen = $state(false);

  $effect(() => {
    if ($authStore.token && !$authStore.profile && !$authStore.loading) void loadProfile();
  });
</script>

<AuthSessionRedirect mode="protected" />

{#if $authStore.profile}
  <div class="min-h-screen">
    <Navbar onmenu={() => (menuOpen = !menuOpen)} />
    <div class="lg:flex">
      <Sidebar open={menuOpen} onnavigate={() => (menuOpen = false)} />
      <main class="min-w-0 flex-1 p-4 sm:p-8">{@render children()}</main>
    </div>
  </div>
{:else}
  <p class="grid min-h-screen place-items-center text-ink-500" role="status">Memuat sesi...</p>
{/if}
