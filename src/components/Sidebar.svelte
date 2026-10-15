<script lang="ts">
  import { page } from "$app/state";
  import { Library, User, Users } from "lucide-svelte";

  let { open = false, onnavigate }: { open?: boolean; onnavigate: () => void } = $props();

  const items = [
    { href: "/", label: "Semua Kursus", icon: Library },
    { href: "/users", label: "Pengguna", icon: Users },
    { href: "/profile", label: "Profil", icon: User },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? page.url.pathname === "/" || page.url.pathname.startsWith("/courses")
      : page.url.pathname.startsWith(href);
</script>

<aside
  class={`fixed inset-y-0 left-0 z-20 w-64 -translate-x-full border-r border-ink-100 bg-white pt-20 transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-6 ${open ? "translate-x-0" : ""}`}
  aria-label="Menu samping"
  data-open={open}
>
  <nav aria-label="Menu utama">
    <ul class="space-y-1 px-3">
      {#each items as item (item.href)}
        {@const Icon = item.icon}
        <li>
          <a
            href={item.href}
            onclick={onnavigate}
            aria-current={isActive(item.href) ? "page" : undefined}
            class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href) ? "bg-ink-800 text-white" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</aside>