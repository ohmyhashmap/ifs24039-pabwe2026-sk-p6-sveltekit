<script lang="ts">
  import { page } from "$app/state";
  import DetailPage from "../../../features/courses/pages/DetailPage.svelte";

  const courseId = $derived(page.params.courseId);
</script>

<svelte:head><title>Detail Kursus · Delcom Courses</title></svelte:head>
<DetailPage courseId={Number(courseId)} />
