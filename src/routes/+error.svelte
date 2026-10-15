<script lang="ts">
  import { page } from "$app/state";
  import { GraduationCap } from "lucide-svelte";
</script>

<svelte:head><title>Halaman tidak ditemukan · Delcom Courses</title></svelte:head>

<section class="mx-auto grid max-w-md place-items-center gap-4 py-16 text-center">
  <GraduationCap size={48} class="text-ink-300" />
  <h1 class="text-2xl font-bold">
    {page.status === 404 ? "Halaman tidak ditemukan" : "Terjadi kesalahan"}
  </h1>
  <p class="text-ink-500">{page.error?.message ?? "Halaman yang Anda cari tidak tersedia."}</p>
  <a href="/" class="rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700">
    Kembali ke Semua Kursus
  </a>
</section>
