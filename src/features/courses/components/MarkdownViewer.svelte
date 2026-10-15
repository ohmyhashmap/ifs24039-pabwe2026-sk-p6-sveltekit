<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import "@toast-ui/editor/dist/toastui-editor-viewer.css";

  export let content: string = "";

  let viewerContainer: HTMLElement;
  let viewerInstance: any = null;

  onMount(async () => {
    try {
      const { default: Viewer } = await import(
        "@toast-ui/editor/dist/toastui-editor-viewer"
      );
      viewerInstance = new Viewer({
        el: viewerContainer,
        initialValue: content || "",
      });
    } catch {
      viewerInstance = null;
    }
  });

  $: if (viewerInstance && content !== undefined) {
    viewerInstance.setMarkdown(content || "");
  }

  onDestroy(() => {
    if (viewerInstance) {
      viewerInstance.destroy();
      viewerInstance = null;
    }
  });
</script>

<div bind:this={viewerContainer} class="toastui-editor-viewer-wrapper" data-testid="markdown-viewer"></div>

<style>
  :global(.toastui-editor-viewer-wrapper .toastui-editor-contents) {
    font-family: inherit;
    font-size: 0.95rem;
    color: #475569;
  }
</style>
