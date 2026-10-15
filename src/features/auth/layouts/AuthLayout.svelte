<script lang="ts">
  import { BookOpen, PlayCircle, Star } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import Logo from "../../../components/Logo.svelte";

  let {
    title,
    subtitle,
    children,
    footer,
  }: { title: string; subtitle: string; children: Snippet; footer?: Snippet } = $props();
</script>

<div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
  <aside aria-label="Tentang Delcom Courses" class="hidden flex-col justify-between bg-ink-800 p-12 text-white lg:flex">
    <Logo dark />
    <div class="max-w-md">
      <h2 class="text-3xl leading-tight font-bold">Belajar lewat video, kapan saja.</h2>
      <p class="mt-4 text-ink-200">
        Delcom Courses adalah tempat membuat dan mengikuti kursus. Pengajar menyusun materi dari
        video YouTube, peserta mendaftar, menandai materi yang selesai, lalu memberi rating.
      </p>
      <ul class="mt-8 space-y-3 text-sm text-ink-100">
        <li class="flex items-center gap-3"><BookOpen size={18} class="text-tassel-400" /> Temukan kursus dari pengguna lain</li>
        <li class="flex items-center gap-3"><PlayCircle size={18} class="text-tassel-400" /> Ikuti materi video secara berurutan</li>
        <li class="flex items-center gap-3"><Star size={18} class="text-tassel-400" /> Beri rating setelah selesai belajar</li>
      </ul>
    </div>
    <p class="text-xs text-ink-300">Delcom Courses &middot; Praktikum PABWE 2026</p>
  </aside>

  <main class="flex items-center justify-center p-6 sm:p-12">
    <div class="w-full max-w-sm">
      <div class="mb-8 lg:hidden"><Logo /></div>
      <h1 class="text-2xl font-bold">{title}</h1>
      <p class="mt-1 mb-6 text-sm text-ink-500">{subtitle}</p>
      {@render children()}
      {#if footer}
        <p class="mt-6 text-center text-sm text-ink-500">{@render footer()}</p>
      {/if}
    </div>
  </main>
</div>