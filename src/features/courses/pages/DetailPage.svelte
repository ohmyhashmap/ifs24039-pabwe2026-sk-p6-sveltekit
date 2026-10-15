<script lang="ts">
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import {
    ArrowLeft,
    Circle,
    CircleCheck,
    GraduationCap,
    ImageUp,
    Lock,
    Pencil,
    Plus,
    Star,
    Trash2,
    Video,
  } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import { confirmAction, formatPercent, formatRating } from "../../../helpers/toolsHelper";
  import { authStore } from "../../auth/states/authStore";
  import ChangeCoverModal from "../components/ChangeCoverModal.svelte";
  import ChangeModal from "../components/ChangeModal.svelte";
  import ContentModal from "../components/ContentModal.svelte";
  import {
    clearMutations,
    coursesStore,
    joinCourse,
    leaveCourse,
    loadCourse,
    rateCourse,
    removeContent,
    removeCourse,
  } from "../states/coursesStore";
  import type { CourseContent, RatingValue } from "../types";

  let { courseId }: { courseId: number } = $props();

  let modal = $state<"edit" | "cover" | "content" | null>(null);
  let editingContent = $state<CourseContent | null>(null);
  let rating = $state(0);
  const { value: comment, reset: resetComment } = useInput();

  const course = $derived($coursesStore.course?.id === courseId ? $coursesStore.course : null);
  const myId = $derived($authStore.profile?.id);
  const isOwner = $derived(course !== null && course.user_id === myId);
  const isStudent = $derived(course !== null && course.students.includes(myId as number));
  const canWatch = $derived(isOwner || isStudent);

  $effect(() => {
    const id = courseId;
    untrack(() => void loadCourse(id));
  });

  $effect(() => {
    if (Object.values($coursesStore.flags).some(Boolean)) {
      clearMutations();
      untrack(() => void loadCourse(courseId));
    }
  });

  function openContent(content: CourseContent | null) {
    editingContent = content;
    modal = "content";
  }

  async function removeThisCourse() {
    if (confirmAction("Hapus kursus ini beserta semua kontennya?") && (await removeCourse(courseId))) {
      await goto("/");
    }
  }

  async function leave() {
    if (confirmAction("Keluar dari kursus ini?")) await leaveCourse(courseId);
  }

  async function removeThisContent(content: CourseContent) {
    if (confirmAction(`Hapus konten "${content.title}"?`)) await removeContent(content.id);
  }

  async function submitRating(event: SubmitEvent) {
    event.preventDefault();
    if (await rateCourse(courseId, { ratings: rating as RatingValue, comment: $comment.trim() })) {
      rating = 0;
      resetComment();
    }
  }
</script>

<section class="mx-auto max-w-4xl">
  <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:underline">
    <ArrowLeft size={16} /> Semua Kursus
  </a>

  {#if !course}
    {#if $coursesStore.error}
      <p class="mt-6 rounded-xl bg-red-50 p-4 text-red-800" role="alert">{$coursesStore.error}</p>
    {:else}
      <p class="mt-6 text-ink-500" role="status">Memuat kursus...</p>
    {/if}
  {:else}
    <header class="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white">
      {#if course.cover}
        <img src={course.cover} alt={`Sampul ${course.title}`} class="aspect-[21/9] w-full object-cover" />
      {:else}
        <div class="grid aspect-[21/9] w-full place-items-center bg-ink-800 text-tassel-400" data-testid="cover-fallback">
          <GraduationCap size={56} />
        </div>
      {/if}
      <div class="space-y-4 p-6">
        <div>
          <h1 class="text-2xl font-bold">{course.title}</h1>
          <p class="mt-1 text-sm text-ink-500">{`Oleh ${course.author.name}`}</p>
        </div>
        <p class="whitespace-pre-line text-ink-700">{course.description}</p>
        <dl class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt class="text-ink-500">Peserta</dt><dd class="font-semibold">{course.students.length}</dd></div>
          <div><dt class="text-ink-500">Konten</dt><dd class="font-semibold">{course.total_contents}</dd></div>
          <div><dt class="text-ink-500">Rating</dt><dd class="font-semibold">{formatRating(course.avg_ratings)}</dd></div>
        </dl>

        {#if isOwner}
          <div class="flex flex-wrap gap-2" data-testid="owner-actions">
            <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium hover:bg-ink-50" onclick={() => (modal = "edit")}>
              <Pencil size={16} /> Ubah data
            </button>
            <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium hover:bg-ink-50" onclick={() => (modal = "cover")}>
              <ImageUp size={16} /> Ubah sampul
            </button>
            <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50" onclick={removeThisCourse}>
              <Trash2 size={16} /> Hapus kursus
            </button>
          </div>
        {:else if isStudent}
          <div class="space-y-3" data-testid="student-actions">
            <div>
              <div class="flex justify-between text-sm">
                <span>Progres belajar</span><span class="font-semibold">{`${formatPercent(course.my_percentage_finished)}%`}</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={formatPercent(course.my_percentage_finished)} aria-valuemin="0" aria-valuemax="100" aria-label="Progres belajar">
                <div class="h-full bg-tassel-500" style={`width: ${formatPercent(course.my_percentage_finished)}%`}></div>
              </div>
            </div>
            <button type="button" class="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50" onclick={leave}>
              Keluar dari kursus
            </button>
          </div>
        {:else}
          <button type="button" class="rounded-xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700" onclick={() => joinCourse(courseId)}>
            Daftar kursus
          </button>
        {/if}
      </div>
    </header>

    <section class="mt-8" aria-labelledby="contents-title">
      <div class="flex items-center justify-between">
        <h2 id="contents-title" class="text-lg font-bold">Konten kursus</h2>
        {#if isOwner}
          <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-ink-800 px-3 py-2 text-sm font-semibold text-white hover:bg-ink-700" onclick={() => openContent(null)}>
            <Plus size={16} /> Tambah konten
          </button>
        {/if}
      </div>

      {#if course.contents.length === 0}
        <p class="mt-4 text-ink-500">Belum ada konten.</p>
      {:else}
        <ul class="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {#each course.contents as content (content.id)}
            <li class="flex items-center gap-3 p-4">
              {#if canWatch}
                <Video size={18} class="shrink-0 text-ink-500" />
                <a href={`/courses/${course.id}/contents/${content.id}`} class="min-w-0 flex-1 truncate font-medium hover:underline">{content.title}</a>
              {:else}
                <Lock size={18} class="shrink-0 text-ink-300" />
                <span class="min-w-0 flex-1 truncate text-ink-500">{content.title}</span>
              {/if}

              {#if isOwner}
                <button type="button" class="rounded-lg p-1.5 hover:bg-ink-100" aria-label={`Ubah ${content.title}`} onclick={() => openContent(content)}><Pencil size={16} /></button>
                <button type="button" class="rounded-lg p-1.5 text-red-700 hover:bg-red-50" aria-label={`Hapus ${content.title}`} onclick={() => removeThisContent(content)}><Trash2 size={16} /></button>
              {:else if isStudent}
                {#if content.my_status_finished}
                  <CircleCheck size={18} class="text-emerald-600" aria-label="Selesai" />
                {:else}
                  <Circle size={18} class="text-ink-300" aria-label="Belum selesai" />
                {/if}
              {/if}
            </li>
          {/each}
        </ul>
        {#if !canWatch}
          <p class="mt-3 text-sm text-ink-500">Daftar kursus untuk membuka materi.</p>
        {/if}
      {/if}
    </section>

    <section class="mt-8" aria-labelledby="ratings-title">
      <h2 id="ratings-title" class="text-lg font-bold">Rating peserta</h2>

      {#if isStudent && !isOwner}
        <form class="mt-4 space-y-3 rounded-2xl border border-ink-100 bg-white p-4" onsubmit={submitRating}>
          <div class="flex gap-1" role="group" aria-label="Pilih rating">
            {#each [1, 2, 3, 4, 5] as value (value)}
              <button
                type="button"
                aria-label={`Beri rating ${value}`}
                aria-pressed={rating === value}
                class="rounded-lg p-1 {value <= rating ? 'text-tassel-500' : 'text-ink-300'}"
                onclick={() => (rating = value)}
              >
                <Star size={24} fill={value <= rating ? "currentColor" : "none"} />
              </button>
            {/each}
          </div>
          <label class="block text-sm font-medium">
            Komentar
            <textarea required rows="3" bind:value={$comment} class="mt-1 w-full rounded-xl border border-ink-200 px-3 py-2.5"></textarea>
          </label>
          <button disabled={rating === 0} class="rounded-xl bg-ink-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-50">
            Kirim rating
          </button>
        </form>
      {/if}

      {#if course.ratings.length === 0}
        <p class="mt-4 text-ink-500">Belum ada rating.</p>
      {:else}
        <ul class="mt-4 space-y-3">
          {#each course.ratings as item, index (index)}
            <li class="rounded-2xl border border-ink-100 bg-white p-4">
              <p class="flex items-center justify-between font-medium">
                <span>{item.name}</span>
                <span class="inline-flex items-center gap-1 text-sm text-tassel-700"><Star size={14} fill="currentColor" />{`${item.ratings}/5`}</span>
              </p>
              <p class="mt-1 text-sm text-ink-700">{item.comment}</p>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</section>

{#if course && modal === "edit"}
  <ChangeModal {course} onclose={() => (modal = null)} />
{:else if modal === "cover"}
  <ChangeCoverModal {courseId} onclose={() => (modal = null)} />
{:else if modal === "content"}
  <ContentModal {courseId} content={editingContent} onclose={() => (modal = null)} />
{/if}
