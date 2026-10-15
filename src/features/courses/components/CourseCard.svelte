<script lang="ts">
  import { GraduationCap, Star, Trash2, Users, Video } from "lucide-svelte";
  import { formatRating } from "../../../helpers/toolsHelper";
  import type { CourseSummary } from "../types";

  let {
    course,
    myId,
    ondelete,
  }: { course: CourseSummary; myId?: number; ondelete: (course: CourseSummary) => void } = $props();

  const isOwner = $derived(course.user_id === myId);
  const isStudent = $derived(course.students.includes(myId as number));
</script>

<article class="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white">
  <a href={`/courses/${course.id}`} class="block" aria-label={`Buka ${course.title}`}>
    {#if course.cover}
      <img src={course.cover} alt={`Sampul ${course.title}`} class="aspect-video w-full object-cover" />
    {:else}
      <div class="grid aspect-video w-full place-items-center bg-ink-800 text-tassel-400" data-testid="cover-fallback">
        <GraduationCap size={44} />
      </div>
    {/if}
  </a>

  <div class="flex flex-1 flex-col gap-3 p-4">
    <div class="flex items-start justify-between gap-2">
      <h2 class="font-semibold leading-snug">
        <a href={`/courses/${course.id}`} class="hover:underline">{course.title}</a>
      </h2>
      {#if isOwner}
        <span class="shrink-0 rounded-full bg-tassel-100 px-2 py-0.5 text-xs font-medium text-tassel-700">Milik Anda</span>
      {:else if isStudent}
        <span class="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">Terdaftar</span>
      {/if}
    </div>
    <p class="line-clamp-2 text-sm text-ink-500">{course.description}</p>
    <p class="text-xs text-ink-500">{`Oleh ${course.author.name}`}</p>

    <div class="mt-auto flex items-center justify-between gap-2 text-xs text-ink-700">
      <span class="inline-flex items-center gap-1" title="Peserta"><Users size={14} />{course.students.length}</span>
      <span class="inline-flex items-center gap-1" title="Konten"><Video size={14} />{course.total_contents}</span>
      <span class="inline-flex items-center gap-1" title="Rating"><Star size={14} />{formatRating(course.avg_ratings)}</span>
      {#if isOwner}
        <button
          type="button"
          class="rounded-lg p-1.5 text-red-700 hover:bg-red-50"
          aria-label={`Hapus ${course.title}`}
          onclick={() => ondelete(course)}
        >
          <Trash2 size={16} />
        </button>
      {/if}
    </div>
  </div>
</article>
