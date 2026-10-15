<script lang="ts">
  import type { Component } from "svelte";
  import Layout from "../routes/+layout.svelte";

  let { Page }: { Page: Component } = $props();
</script>

<Layout><Page /></Layout>
