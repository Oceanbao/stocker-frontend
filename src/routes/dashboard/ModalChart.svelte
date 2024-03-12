<script lang="ts">
	import './modelchart.css';

	import { Loader2 } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import {
		computeKDJ,
		computeMACD,
		computeSMA,
		type TDaily,
		type TEma,
		type TKdj,
		type TMacd
	} from '$lib/charts';
	// import { Button } from '$lib/components/ui/button';
	import ChartStock from '$lib/components/ChartStock.svelte';
	import { Badge } from '$lib/components/ui/badge';
	// import { applyAction, enhance } from '$app/forms';
	// import type { SubmitFunction } from '@sveltejs/kit';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { TServerStock } from '$lib/server/types';
	import { cn } from '$lib/utils';

	import { sActiveSector, sActiveTab, sModalData, stockStore } from './store';

	let dailyCache: Map<string, Record<string, string>[]> = new Map();
	let candleData: TDaily[];
	let kdjData: TKdj[];
	let macdData: TMacd[];
	let sma5Data: TEma[];
	let sma20Data: TEma[];
	// let sma30Data: TEma[];
	// let sma90Data: TEma[];
	// let sma120Data: TEma[];
	let loadingRequest = true;
	let activeTicker = '';
	let activeName = '';
	let activeStock: TServerStock | undefined;
	let activeTabStocks: TServerStock[];
	let sActiveTabStocks;
	let activeTickerIndexInTab: number;

	// $: {
	// 	console.log($sActiveTab);
	// 	sActiveTabStocks = getActiveTabStocks($sActiveTab);
	// 	console.log($sActiveTabStocks);
	// 	activeTabStocks = $sActiveTabStocks ?? [];
	// }

	$: if ($sModalData.open) {
		activeTicker = $sModalData.ticker;
		activeName = $sModalData.name;
		sActiveTabStocks = getActiveTabStocks($sActiveTab);
		activeTabStocks = $sActiveTabStocks ?? [];
		activeTickerIndexInTab = activeTabStocks.findIndex((x) => x.ticker === activeTicker);
		loadData();
	}

	$: if (activeTickerIndexInTab !== undefined) {
		activeTicker = activeTabStocks[activeTickerIndexInTab].ticker;
		activeName = activeTabStocks[activeTickerIndexInTab].name;
		loadData();
	}

	function getActiveTabStocks(tab: string) {
		switch (tab) {
			case 'screener':
				return stockStore.getReadStocksScreen();
			case 'tracking':
				return stockStore.getReadStocksTracking();
			case 'sector':
				return stockStore.getReadStocksSector($sActiveSector);
		}
	}

	async function loadData() {
		// Reset dialog states
		loadingRequest = true;

		let dataStored = dailyCache.get(activeTicker);
		if (!dataStored) {
			dataStored = await fetchDaily(activeTicker);
			if (!dataStored) {
				console.log('ERROR: failed to fetch `daily` data');
				loadingRequest = false;
				return;
			}
			dailyCache.set(activeTicker, dataStored);
		}

		activeStock = $stockStore.find((x) => x.ticker === activeTicker);

		//TODO: could improve by cahcing these.
		candleData = dataStored?.map((x) => ({
			time: x.date.slice(0, 10),
			open: parseFloat(x.open),
			high: parseFloat(x.high),
			low: parseFloat(x.low),
			close: parseFloat(x.close)
		}));
		kdjData = computeKDJ(candleData);
		macdData = computeMACD(candleData);
		// ema5Data = computeEMA(candleData, 5);
		// ema50Data = computeEMA(candleData, 50);
		sma5Data = computeSMA(candleData, 5);
		sma20Data = computeSMA(candleData, 20);
		// sma30Data = computeSMA(candleData, 30);
		// sma90Data = computeSMA(candleData, 90);
		// sma120Data = computeSMA(candleData, 120);
		loadingRequest = false;
	}

	async function fetchDaily(ticker: string) {
		const baseUrl = '/api/daily';
		const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
			method: 'GET'
		});
		try {
			const body = await resp.json();
			if (body.data) {
				return body.data;
			}
		} catch (err) {
			console.log(err);
			return;
		}
	}

	function keyDownHandler(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowRight':
				activeTickerIndexInTab = getRightIndex(activeTickerIndexInTab);
				break;
			case 'ArrowLeft':
				activeTickerIndexInTab = getLeftIndex(activeTickerIndexInTab);
				break;
		}
	}

	function getRightIndex(currentIndex: number) {
		const lastIndex = activeTabStocks.length - 1;
		const nextIndex = currentIndex + 1;
		return nextIndex <= lastIndex ? nextIndex : 0;
	}

	function getLeftIndex(currentIndex: number) {
		const lastIndex = activeTabStocks.length - 1;
		const nextIndex = currentIndex - 1;
		return nextIndex < 0 ? lastIndex : nextIndex;
	}

	onMount(() => {
		window.addEventListener('keydown', keyDownHandler);

		return () => {
			window.removeEventListener('keydown', keyDownHandler);
		};
	});
</script>

<Dialog.Root open={$sModalData.open} onOpenChange={() => ($sModalData.open = false)}>
	<Dialog.Content
		class={cn(
			'flex flex-col border border-blue-400 rounded-lg h-[100dvh] w-[100dvw] lg:h-[90%] lg:max-w-[90%]',
			'[&_.lucide-x]:text-blue-400',
			'[&_.lucide-x]:w-10',
			'[&_.lucide-x]:h-10'
		)}
		style=""
	>
		<Dialog.Header>
			<Dialog.Title class="text-sm lg:text-xl">{activeTicker} - {activeName}</Dialog.Title>
			<Dialog.Description class="flex flex-wrap gap-2 [&_span]:text-xs lg:[&_span]:text-lg">
				{#if activeStock}
					<Badge variant="secondary" class="w-fit h-fit"
						>$ {(activeStock.dailyvalue / 100_000_000).toFixed(2)}</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>{activeStock.sector} {activeStock.sectortotal}</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>cap {(Math.pow(2, activeStock.tradecap) / 100_000_000).toFixed(
							2
						)}({activeStock.ranktotalcap})</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit">eps {activeStock.eps.toFixed(2)}</Badge>
					<Badge variant="secondary" class="w-fit h-fit"
						>pe {activeStock.priceperearning / 100}({activeStock.rankper})</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>roe {activeStock.roe.toFixed(2)}({activeStock.rankroe})</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit">
						netp {(activeStock.netprofit / 100_000_000).toFixed(
							2
						)}({activeStock.ranknetprofit}-{activeStock.ranknetmargin})
					</Badge>
					<Badge variant="secondary" class="w-fit h-fit">
						gross {activeStock.grossprofitmargin.toFixed(2)}({activeStock.rankgrossmargin})
					</Badge>
					<Badge variant="secondary" class="w-fit h-fit">
						debt {activeStock.debtratio.toFixed(2)}
					</Badge>
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid w-full h-full place-items-center">
			{#if loadingRequest}
				<Loader2 class="animate-spin w-32 h-32" style="animation-direction: reverse" />
			{:else}
				<ChartStock
					{candleData}
					lineDataK={kdjData.map((x) => ({ time: x.time, value: x.k }))}
					lineDataD={kdjData.map((x) => ({ time: x.time, value: x.d }))}
					lineDataJ={kdjData.map((x) => ({ time: x.time, value: x.j }))}
					lineDataMacdHist={macdData.map((x) => ({
						time: x.time,
						color: x.hist > 0 ? 'green' : 'red',
						value: x.hist
					}))}
					lineDataMacdDiff={macdData.map((x) => ({
						time: x.time,
						value: x.diff
					}))}
					lineDataMacdDea={macdData.map((x) => ({
						time: x.time,
						value: x.dea
					}))}
					lineDataSma5={sma5Data}
					lineDataSma20={sma20Data}
				/>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
