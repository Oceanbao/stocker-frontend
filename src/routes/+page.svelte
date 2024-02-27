<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	export let data;
</script>

<main class="h-full grid place-items-center">
	<Card.Root class="w-80">
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-2xl">Stocker</Card.Title>
			<Card.Description>Welcome to the Stocker App.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t" />
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="flex justify-center">
			{#if data.user}
				<div class="flex flex-col">
					<p>You're logged in as: {data.user.name}</p>
					<Button href="/dashboard" class="my-4">Dashboard</Button>
				</div>
			{:else}
				<a href="/login">
					<Button type="button" class="w-full">Login</Button>
				</a>
			{/if}
		</Card.Footer>
	</Card.Root>
</main>
