<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	export let num = 1;
</script>

<div class="flex flex-wrap gap-4">
	{#each Array.from(Array(num).keys()) as idx}
		<div class="flex items-center space-x-4" data-index={idx}>
			<Skeleton class="h-12 w-12 rounded-full" />
			<div class="space-y-2">
				<Skeleton class="h-4 w-[250px]" />
				<Skeleton class="h-4 w-[200px]" />
			</div>
		</div>
	{/each}
</div>
