<script lang="ts">
	import SkeletonA from '$lib/components/SkeletonA.svelte';
	// import { cn, diffDay } from '$lib/utils';
	import * as Tabs from '$lib/components/ui/tabs';

	// import { applyAction, enhance } from '$app/forms';
	import DashboardMainNav from './MainNav.svelte';
	import ModalChart from './ModalChart.svelte';
	import Screener from './Screener.svelte';
	import Search from './Search.svelte';
	import Sector from './Sector.svelte';
	import { sActiveTab } from './store';
	import Tracking from './Tracking.svelte';
	import UserNav from './UserNav.svelte';

	export let data;

	const initialTab = 'screener';
	$sActiveTab = initialTab;

	function onTabChangeHandler(v: string | undefined) {
		$sActiveTab = v ?? '';
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

			<Tabs.Root class="space-y-4" value={initialTab} onValueChange={onTabChangeHandler}>
				<Tabs.List class="overflow-x-auto w-full justify-start">
					<Tabs.Trigger value="screener">Screener</Tabs.Trigger>
					<Tabs.Trigger value="tracking">Tracking</Tabs.Trigger>
					<Tabs.Trigger value="sector">Sector</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="screener" class="space-y-4">
					{#await data.recordsScreen}
						<SkeletonA num={3} />
					{:then value}
						<Screener thenData={value} />
					{:catch error}
						<p>{error.message}</p>
					{/await}
				</Tabs.Content>

				<Tabs.Content value="tracking" class="space-y-4">
					{#await data.recordsTracking}
						<SkeletonA num={3} />
					{:then value}
						<Tracking thenData={value} />
					{:catch error}
						<p>{error.message}</p>
					{/await}
				</Tabs.Content>

				<Tabs.Content value="sector" class="space-y-4">
					{#await data.recordsSector}
						<SkeletonA num={3} />
					{:then value}
						<Sector thenData={value} />
					{:catch error}
						<p>{error.message}</p>
					{/await}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</main>
