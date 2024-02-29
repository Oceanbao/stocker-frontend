<script lang="ts">
	// import { applyAction, enhance } from '$app/forms';

	// import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	// import { Button } from '$lib/components/ui/button';
	// import { Badge } from '$lib/components/ui/badge';

	import ModalChart from './ModalChart.svelte';
	// import { cn, diffDay } from '$lib/utils';
	import DashboardMainNav from './MainNav.svelte';
	import Search from './Search.svelte';
	import UserNav from './UserNav.svelte';
	import Screener from './Screener.svelte';
	import SkeletonA from '$lib/components/SkeletonA.svelte';
	import { sTrackedStocks } from './store';
	// import { Loader2 } from 'lucide-svelte';

	export let data;

	// FIXME
	if (data.recordsTracking) {
		data.recordsTracking.forEach((x) => {
			$sTrackedStocks.push(x.ticker);
		});
	}
</script>

<ModalChart />

<main>
	<div class="flex-col md:flex">
		<div class="border-b">
			<div class="flex h-16 items-center px-4">
				<DashboardMainNav class="mx-6" />
				<div class="ml-auto flex items-center space-x-4">
					<Search />
					<UserNav username={data.user?.name} useremail={data.user?.email} />
				</div>
			</div>
		</div>
		<div class="flex-1 space-y-4 p-8 pt-6">
			<div class="flex items-center justify-between space-y-2">
				<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
			</div>
			<Tabs.Root value="screener" class="space-y-4">
				<Tabs.List class="overflow-x-auto w-full justify-start">
					<Tabs.Trigger value="screener">Screener</Tabs.Trigger>
					<Tabs.Trigger value="notifications" disabled>Notifications</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="screener" class="space-y-4">
					{#await data.recordsScreen}
						<div class="grid">
							<SkeletonA num={3} />
						</div>
					{:then value}
						<Screener records={value} />
					{:catch error}
						<p>{error.message}</p>
					{/await}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</main>

<style>
</style>
