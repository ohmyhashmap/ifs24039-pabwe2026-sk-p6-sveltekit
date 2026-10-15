<script lang="ts">
  import { page } from "$app/state";
  import ContentPage from "../../../../../features/courses/pages/ContentPage.svelte";

  const courseId = $derived(page.params.courseId);
  const contentId = $derived(page.params.contentId);
</script>

<svelte:head><title>Materi · Delcom Courses</title></svelte:head>
<ContentPage courseId={Number(courseId)} contentId={Number(contentId)} />
