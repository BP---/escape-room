<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold mb-6">Escape Room</h1>
			<p class="text-lg mb-8">
				Challenge your mind with interactive escape room puzzles. Create your own escape rooms or
				continue solving existing ones.
			</p>
			<div class="flex gap-4 justify-center">
				<a href="/create" class="btn btn-primary btn-lg">
					Create Escape Room
				</a>
				<a href="/continue" class="btn btn-secondary btn-lg">
					Continue Playing
				</a>
			</div>
			{#if !data.user}
				<div class="mt-6">
					<a href="/login" class="link link-hover">Login to get started</a>
				</div>
			{/if}
		</div>
	</div>
</div>