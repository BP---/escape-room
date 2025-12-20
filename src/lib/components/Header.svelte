<script lang="ts">
	import { useSession } from '$lib/auth-client';

	const session = useSession();
</script>

<header class="navbar bg-base-200 px-4">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Escape Room</a>
	</div>
	<div class="flex-none">
		{#if $session.data?.user}
			<div class="dropdown dropdown-end">
				<button tabindex="0" class="btn btn-ghost">
					{$session.data.user.name ?? $session.data.user.email}
					<svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
						<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
					</svg>
				</button>
				<ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
					<li><a href="/user">Profile</a></li>
					<li><a href="/logout">Logout</a></li>
				</ul>
			</div>
		{:else}
			<a href="/login" class="btn btn-primary">Login</a>
		{/if}
	</div>
</header>
