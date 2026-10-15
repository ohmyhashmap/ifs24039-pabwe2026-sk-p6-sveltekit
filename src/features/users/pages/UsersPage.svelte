<script lang="ts">
  import Avatar from "../../../components/Avatar.svelte";
  import { formatDate } from "../../../helpers/toolsHelper";
  import { authStore } from "../../auth/states/authStore";
  import { loadUsers, usersStore } from "../states/usersStore";

  const myId = $derived($authStore.profile?.id);

  $effect(() => {
    void loadUsers();
  });
</script>

<section class="mx-auto max-w-4xl">
  <h1 class="text-2xl font-bold">Pengguna</h1>
  <p class="mt-1 text-sm text-ink-500">Semua orang yang terdaftar di Delcom Courses.</p>

  {#if $usersStore.loading}
    <p class="mt-8 text-ink-500" role="status">Memuat pengguna...</p>
  {:else if $usersStore.error}
    <p class="mt-8 rounded-xl bg-red-50 p-4 text-red-800" role="alert">{$usersStore.error}</p>
  {:else if $usersStore.users.length === 0}
    <p class="mt-8 text-ink-500">Belum ada pengguna terdaftar.</p>
  {:else}
    <ul class="mt-6 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
      {#each $usersStore.users as user (user.id)}
        <li class="flex items-center gap-4 p-4">
          <Avatar name={user.name} src={user.photo} />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold">
              <span>{user.name}</span>
              {#if user.id === myId}
                <span class="ml-2 rounded-full bg-tassel-100 px-2 py-0.5 text-xs text-tassel-700">Anda</span>
              {/if}
            </p>
            <p class="truncate text-sm text-ink-500">{user.email}</p>
          </div>
          <p class="hidden text-xs text-ink-500 sm:block">Bergabung {formatDate(user.created_at)}</p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
