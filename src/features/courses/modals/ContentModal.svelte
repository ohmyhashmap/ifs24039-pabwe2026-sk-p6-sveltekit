<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Video, X, LoaderCircle, Plus, PenLine } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import type { CourseContent } from "../api/courseApi";

  export let show: boolean = false;
  export let courseId: string | number | null = null;
  export let content: CourseContent | null = null;
  export let onClose: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let loading: boolean = false;
  let title: string = "";
  let youtube: string = "";

  function handleClose() {
    title = "";
    youtube = "";
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
      if (content) {
        title = content.title;
        youtube = content.youtube;
      } else {
        title = "";
        youtube = "";
      }
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if ($coursesStore.isCourseContentAdd) {
    loading = false;
    coursesStore.setIsCourseContentAdd(false);
    if ($coursesStore.isCourseContentAdded) {
      coursesStore.setIsCourseContentAdded(false);
      if (courseId) {
        coursesStore.asyncSetCourse(courseId);
      }
      handleClose();
    }
  }

  $: if ($coursesStore.isCourseContentChange) {
    loading = false;
    coursesStore.setIsCourseContentChange(false);
    if ($coursesStore.isCourseContentChanged) {
      coursesStore.setIsCourseContentChanged(false);
      if (courseId) {
        coursesStore.asyncSetCourse(courseId);
      }
      if (content?.id) {
        coursesStore.asyncSetCourseContent(content.id);
      }
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul konten tidak boleh kosong");
      return;
    }

    if (!youtube.trim()) {
      showErrorDialog("Tautan video YouTube tidak boleh kosong");
      return;
    }

    loading = true;

    if (content?.id) {
      coursesStore.asyncSetIsCourseContentChange(
        content.id,
        title.trim(),
        youtube.trim()
      );
    } else if (courseId) {
      coursesStore.asyncSetIsCourseContentAdd(
        courseId,
        title.trim(),
        youtube.trim()
      );
    } else {
      loading = false;
    }
  }
</script>

{#if show}
  <div
    data-testid="content-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Video size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">
              {content ? "Ubah Konten Video" : "Tambah Konten Video"}
            </h3>
            <p class="text-xs text-slate-500">
              {content ? "Perbarui materi pembelajaran video" : "Tambahkan video materi baru ke kursus"}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-content-modal-btn"
          on:click={handleClose}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <!-- Form Body -->
      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <label for="content-title-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Judul Video / Materi <span class="text-red-500">*</span>
          </label>
          <input
            id="content-title-input"
            type="text"
            data-testid="content-title-input"
            bind:value={title}
            placeholder="Contoh: Pengenalan SvelteKit 3"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            required
          />
        </div>

        <div>
          <label for="content-youtube-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Tautan / URL YouTube <span class="text-red-500">*</span>
          </label>
          <input
            id="content-youtube-input"
            type="text"
            data-testid="content-youtube-input"
            bind:value={youtube}
            placeholder="https://www.youtube.com/watch?v=..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            required
          />
          <p class="text-xs text-slate-400 mt-1">Masukkan URL YouTube lengkap atau ID video.</p>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-content-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-content-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else if content}
              <PenLine size={18} strokeWidth={2.5} />
              <span>Simpan Perubahan</span>
            {:else}
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Konten</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
