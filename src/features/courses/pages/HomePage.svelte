<script lang="ts">
  import { untrack } from "svelte";
  import { Plus, Search, Trash2 } from "lucide-svelte";
  import { confirmAction, matchesQuery } from "../../../helpers/toolsHelper";
  import { authStore } from "../../auth/states/authStore";
  import AddModal from "../components/AddModal.svelte";
  import CourseCard from "../components/CourseCard.svelte";
  import {
    clearMutations,
    coursesStore,
    loadCourses,
    removeAllCourses,
    removeCourse,
  } from "../states/coursesStore";
  import type { CourseSummary } from "../types";

  let query = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const myId = $derived($authStore.profile?.id);
  const visible = $derived(
    $coursesStore.courses.filter((course) =>
      matchesQuery(query, course.title, course.description, course.author.name),
    ),
  );
  const hasMine = $derived($coursesStore.courses.some((course) => course.user_id === myId));

  $effect(() => {
    const mine = onlyMine;
    untrack(() => void loadCourses(mine));
  });

  $effect(() => {
    const { course, cover, student } = $coursesStore.flags;
    if (course || cover || student) {
      clearMutations();
      untrack(() => void loadCourses(onlyMine));
    }
  });

  async function remove(course: CourseSummary) {
    if (confirmAction(`Hapus kursus "${course.title}"?`)) await removeCourse(course.id);
  }

  async function removeAll() {
    if (confirmAction("Hapus semua kursus yang Anda buat? Tindakan ini tidak dapat dibatalkan.")) {
      await removeAllCourses();
    }
  }
</script>

<section class="mx-auto max-w-6xl">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold">Semua Kursus</h1>
      <p class="mt-1 text-sm text-ink-500">Pilih kursus untuk dipelajari, atau buat kursus sendiri.</p>
    </div>
    <div class="flex flex-wrap gap-2">
      {#if hasMine}
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
          onclick={removeAll}
        >
          <Trash2 size={16} /> Hapus semua kursus saya
        </button>
      {/if}
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700"
        onclick={() => (showAdd = true)}
      >
        <Plus size={16} /> Tambah kursus
      </button>
    </div>
  </div>

  <div class="mt-6 flex flex-wrap items-center gap-4">
    <label class="relative min-w-60 flex-1">
      <span class="sr-only">Cari kursus</span>
      <Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-500" />
      <input
        type="search"
        placeholder="Cari judul, deskripsi, atau pengajar"
        bind:value={query}
        class="w-full rounded-xl border border-ink-200 bg-white py-2.5 pr-3 pl-9"
      />
    </label>
    <label class="inline-flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" bind:checked={onlyMine} class="size-4 accent-ink-800" />
      Hanya milik saya
    </label>
  </div>

  {#if $coursesStore.loading && $coursesStore.courses.length === 0}
    <p class="mt-10 text-ink-500" role="status">Memuat kursus...</p>
  {:else if $coursesStore.error}
    <p class="mt-10 rounded-xl bg-red-50 p-4 text-red-800" role="alert">{$coursesStore.error}</p>
  {:else if visible.length === 0}
    <p class="mt-10 text-ink-500">
      {query ? "Tidak ada kursus yang cocok dengan pencarian." : "Belum ada kursus. Tambahkan yang pertama."}
    </p>
  {:else}
    <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {#each visible as course (course.id)}
        <CourseCard {course} {myId} ondelete={remove} />
      {/each}
    </div>
  {/if}
</section>

{#if showAdd}
  <AddModal onclose={() => (showAdd = false)} />
{/if}
