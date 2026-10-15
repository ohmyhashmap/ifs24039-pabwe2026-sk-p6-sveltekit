<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "../states/authStore";

  /**
   * guest     : halaman tamu (login/daftar) dialihkan ke beranda bila profil sudah tersedia.
   * protected : halaman terlindungi dialihkan ke login bila tidak ada token.
   */
  let { mode }: { mode: "guest" | "protected" } = $props();

  $effect(() => {
    if (mode === "guest" && $authStore.profile) {
      void goto("/");
    } else if (mode === "protected" && !$authStore.token) {
      void goto("/auth/login");
    }
  });
</script>
