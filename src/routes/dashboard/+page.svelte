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
	import Tracking from './Tracking.svelte';
	import SkeletonA from '$lib/components/SkeletonA.svelte';
	import { type TStockPage, stockStore } from './store';
	import type { TScreen, TStock } from '$lib/server/types';
	import Sector from './Sector.svelte';

	export let data;

	// FIXME this pile of shit
	const allStocks: TStockPage[] = [];
	data.recordsScreen.forEach((stockScreen: TScreen) => {
		allStocks.push({
			stock: stockScreen.stock,
			kdj: stockScreen.kdj,
			tracked: data.recordsTracking.some((x: TStock) => x.ticker === stockScreen.stock.ticker),
			sector: stockScreen.stock.sector
		});
	});
	data.recordsSector.forEach((stockSector: TStock) => {
		if (!allStocks.some((x) => x.stock.ticker === stockSector.ticker)) {
			allStocks.push({
				stock: stockSector,
				kdj: 0,
				tracked: data.recordsTracking.some((x: TStock) => x.ticker === stockSector.ticker),
				sector: stockSector.sector
			});
		}
	});
	data.recordsTracking.forEach((stockTracking: TStock) => {
		if (!allStocks.some((x) => x.stock.ticker === stockTracking.ticker)) {
			allStocks.push({
				stock: stockTracking,
				kdj: 0,
				tracked: true,
				sector: stockTracking.sector
			});
		}
	});
	$stockStore = [...allStocks.values()];
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

			<Tabs.Root class="space-y-4">
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
