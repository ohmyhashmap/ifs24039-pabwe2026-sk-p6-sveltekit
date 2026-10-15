<script lang="ts">
  import { untrack } from "svelte";
  import { ArrowLeft, Check, Lock, Video } from "lucide-svelte";
  import { getYoutubeId } from "../../../helpers/toolsHelper";
  import { authStore } from "../../auth/states/authStore";
  import {
    clearMutations,
    coursesStore,
    loadContent,
    loadCourse,
    setContentStatus,
  } from "../states/coursesStore";

  let { courseId, contentId }: { courseId: number; contentId: number } = $props();

  const course = $derived($coursesStore.course?.id === courseId ? $coursesStore.course : null);
  const content = $derived($coursesStore.content?.id === contentId ? $coursesStore.content : null);
  const myId = $derived($authStore.profile?.id);
  const isOwner = $derived(course !== null && course.user_id === myId);
  const isStudent = $derived(course !== null && course.students.includes(myId as number));

  function reload() {
    untrack(() => {
      void loadCourse(courseId);
      void loadContent(contentId);
    });
  }

  $effect(() => {
    void courseId;
    void contentId;
    reload();
  });

  $effect(() => {
    if (Object.values($coursesStore.flags).some(Boolean)) {
      clearMutations();
      reload();
    }
  });
</script>

<section class="mx-auto max-w-4xl">
  <a href={`/courses/${courseId}`} class="inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:underline">
    <ArrowLeft size={16} /><span>{course ? course.title : "Kembali ke kursus"}</span>
  </a>

  {#if !content || !course}
    {#if $coursesStore.error}
      <p class="mt-6 rounded-xl bg-red-50 p-4 text-red-800" role="alert">{$coursesStore.error}</p>
    {:else}
      <p class="mt-6 text-ink-500" role="status">Memuat materi...</p>
    {/if}
  {:else}
    <h1 class="mt-4 flex items-center gap-3 text-2xl font-bold">
      <Video size={24} class="text-ink-500" /><span>{content.title}</span>
    </h1>

    {#if isOwner || isStudent}
      {@const videoId = getYoutubeId(content.youtube)}
      {#if videoId}
        <div class="mt-6 aspect-video overflow-hidden rounded-2xl bg-ink-900">
          <iframe
            class="size-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={content.title}
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      {:else}
        <p class="mt-6 rounded-xl bg-red-50 p-4 text-red-800" role="alert">Tautan video tidak valid.</p>
      {/if}

      {#if isOwner}
        <p class="mt-4 text-sm text-ink-500">Anda melihat materi ini sebagai pemilik kursus.</p>
      {:else}
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold {content.my_status_finished
            ? 'border border-ink-200 hover:bg-ink-50'
            : 'bg-ink-800 text-white hover:bg-ink-700'}"
          onclick={() => setContentStatus(content.id, content.my_status_finished ? 0 : 1)}
        >
          <Check size={16} />
          {content.my_status_finished ? "Tandai belum selesai" : "Tandai selesai"}
        </button>
      {/if}
    {:else}
      <div class="mt-6 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-ink-700">
        <Lock size={20} />
        <p>Daftar kursus ini terlebih dahulu untuk menonton materi.</p>
      </div>
    {/if}
  {/if}
</section>
