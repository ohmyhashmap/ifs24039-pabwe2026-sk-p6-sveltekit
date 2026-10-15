<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { PenLine, X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import courseApi from "../api/courseApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import MarkdownEditor from "../components/MarkdownEditor.svelte";

  export let show: boolean = false;
  export let courseId: string | number | null = null;
  export let onClose: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let loading: boolean = false;
  let fetchingCourse: boolean = false;
  let title: string = "";
  let description: string = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if (show && courseId) {
    loadCourseData(courseId);
  }

  async function loadCourseData(id: string | number) {
    fetchingCourse = true;
    try {
      const course = await courseApi.getCourseById(id);
      title = course.title || "";
      description = course.description || "";
    } catch {
      showErrorDialog("Gagal mengambil data kursus");
      handleClose();
    } finally {
      fetchingCourse = false;
    }
  }

  $: if ($coursesStore.isCourseChange) {
    loading = false;
    coursesStore.setIsCourseChange(false);
    if ($coursesStore.isCourseChanged) {
      coursesStore.setIsCourseChanged(false);
      coursesStore.asyncSetCourses();
      if (courseId) {
        coursesStore.asyncSetCourse(courseId);
      }
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    if (!courseId) return;

    loading = true;
    coursesStore.asyncSetIsCourseChange(
      courseId,
      title.trim(),
      description.trim()
    );
  }
</script>

{#if show}
  <div
    data-testid="edit-course-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <PenLine size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Ubah Data Kursus</h3>
          <p class="text-xs text-slate-500">Perbarui judul dan deskripsi materi pembelajaran kursus</p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-edit-modal-btn"
        on:click={handleClose}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    <!-- Modal Form Body -->
    <form on:submit|preventDefault={handleSave} class="flex-1 flex flex-col min-h-0 bg-white">
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-4 w-full">
        {#if fetchingCourse}
          <div class="flex-1 flex items-center justify-center">
            <LoaderCircle size={32} class="animate-spin text-amber-600" />
          </div>
        {:else}
          <div class="shrink-0">
            <label for="edit-course-title-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Judul Kursus <span class="text-red-500">*</span>
            </label>
            <input
              id="edit-course-title-input"
              type="text"
              data-testid="edit-course-title-input"
              bind:value={title}
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>

          <div class="flex-1 flex flex-col min-h-0">
            <span class="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0">
              Deskripsi (Markdown) <span class="text-red-500">*</span>
            </span>
            <div class="flex-1 min-h-[300px]">
              <MarkdownEditor
                bind:value={description}
                placeholder="Tuliskan rincian silabus kursus..."
                height="100%"
                textareaTestId="edit-course-description-input"
              />
            </div>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
        <button
          type="button"
          data-testid="cancel-edit-modal-btn"
          on:click={handleClose}
          disabled={loading}
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-edit-modal-btn"
          disabled={loading || fetchingCourse}
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-600/25 transition-all disabled:opacity-60"
        >
          {#if loading}
            <LoaderCircle size={18} class="animate-spin" />
            <span>Menyimpan...</span>
          {:else}
            <PenLine size={18} strokeWidth={2.5} />
            <span>Perbarui Kursus</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
{/if}
