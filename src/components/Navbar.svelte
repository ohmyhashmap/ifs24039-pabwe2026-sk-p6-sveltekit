<script lang="ts">
  import { LogOut, Menu } from "lucide-svelte";
  import { authStore, logout } from "../features/auth/states/authStore";
  import Avatar from "./Avatar.svelte";
  import Logo from "./Logo.svelte";

  let { onmenu }: { onmenu: () => void } = $props();
  const profile = $derived($authStore.profile);
</script>

<header class="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
  <nav class="flex h-16 items-center justify-between px-4 sm:px-6" aria-label="Navigasi utama">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
        aria-label="Buka menu"
        onclick={onmenu}
      >
        <Menu size={20} />
      </button>
      <a href="/" aria-label="Beranda Delcom Courses"><Logo /></a>
    </div>

    <div class="flex items-center gap-3">
      {#if profile}
        <a href="/profile" class="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 hover:bg-ink-50">
          <Avatar name={profile.name} src={profile.photo} size="sm" />
          <span class="hidden text-sm font-medium sm:inline">{profile.name}</span>
        </a>
      {/if}
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
        onclick={() => logout()}
      >
        <LogOut size={16} />
        <span>Keluar</span>
      </button>
    </div>
  </nav>
</header>
