<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Star, X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show: boolean = false;
  export let courseId: string | number | null = null;
  export let initialRating: number = 5;
  export let initialComment: string = "";
  export let onClose: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let loading: boolean = false;
  let ratings: number = 5;
  let comment: string = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
      ratings = initialRating;
      comment = initialComment;
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if ($coursesStore.isCourseStudentRating) {
    loading = false;
    coursesStore.setIsCourseStudentRating(false);
    if ($coursesStore.isCourseStudentRated) {
      coursesStore.setIsCourseStudentRated(false);
      if (courseId) {
        coursesStore.asyncSetCourse(courseId);
      }
      handleClose();
    }
  }

  function handleSave() {
    if (ratings < 1 || ratings > 5) {
      showErrorDialog("Rating harus antara 1 sampai 5 bintang");
      return;
    }

    if (!courseId) return;

    loading = true;
    coursesStore.asyncSetIsCourseStudentRating(courseId, ratings, comment.trim());
  }

  export function getStarClass(star: number, currentRating: number): string {
    return star <= currentRating ? "fill-amber-400 text-amber-400" : "text-slate-300";
  }
</script>

{#if show}
  <div
    data-testid="rating-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Star size={18} strokeWidth={2.5} class="fill-amber-500 text-amber-500" />
          </div>
          <h3 class="text-base font-bold text-slate-800">Beri Rating Kursus</h3>
        </div>
        <button
          type="button"
          data-testid="close-rating-modal-btn"
          on:click={handleClose}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <!-- Form Body -->
      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <span class="block text-sm font-semibold text-slate-700 mb-2">
            Pilih Bintang Rating
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-testid="star-1"
              on:click={() => (ratings = 1)}
              class="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star size={28} class={getStarClass(1, ratings)} />
            </button>
            <button
              type="button"
              data-testid="star-2"
              on:click={() => (ratings = 2)}
              class="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star size={28} class={getStarClass(2, ratings)} />
            </button>
            <button
              type="button"
              data-testid="star-3"
              on:click={() => (ratings = 3)}
              class="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star size={28} class={getStarClass(3, ratings)} />
            </button>
            <button
              type="button"
              data-testid="star-4"
              on:click={() => (ratings = 4)}
              class="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star size={28} class={getStarClass(4, ratings)} />
            </button>
            <button
              type="button"
              data-testid="star-5"
              on:click={() => (ratings = 5)}
              class="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star size={28} class={getStarClass(5, ratings)} />
            </button>
            <span class="ml-2 text-sm font-bold text-slate-700">{ratings} / 5</span>
          </div>
        </div>

        <div>
          <label for="rating-comment-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Komentar / Ulasan
          </label>
          <textarea
            id="rating-comment-input"
            data-testid="rating-comment-input"
            bind:value={comment}
            rows={3}
            placeholder="Tuliskan pengalaman atau masukan Anda mengenai kursus ini..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs resize-none"
          ></textarea>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-rating-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-rating-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl shadow-md shadow-amber-500/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Mengirim...</span>
            {:else}
              <Star size={18} class="fill-white" />
              <span>Kirim Rating</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
