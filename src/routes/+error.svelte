<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.error?.message}</title>
</svelte:head>

<main>
	<div
		class="absolute inset-0 bg-cover"
		style="
				background-image: url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);
			"
	/>
	<div class="relative z-20 flex items-center text-lg font-medium">Whooops!</div>
	<div class="relative z-20 mt-auto">
		<blockquote class="space-y-2">
			<p class="text-lg">{$page.status}</p>
			<footer class="text-sm">{$page.error?.message}</footer>
		</blockquote>
	</div>
</main>
