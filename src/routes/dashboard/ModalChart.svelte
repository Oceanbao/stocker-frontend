<script lang="ts">
	import './modelchart.css';
	// import { applyAction, enhance } from '$app/forms';
	// import type { SubmitFunction } from '@sveltejs/kit';
	import * as Dialog from '$lib/components/ui/dialog';
	// import { Button } from '$lib/components/ui/button';
	import ChartStock from '$lib/components/ChartStock.svelte';
	import { Loader2 } from 'lucide-svelte';
	import { sModalData } from './store';
	import {
		computeKDJ,
		computeMACD,
		computeSMA,
		type TDaily,
		type TKdj,
		type TMacd,
		type TEma
	} from '$lib/charts';
	import { cn } from '$lib/utils';

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

	async function openDialog() {
		// Reset dialog states
		loadingRequest = true;

		let dataStored = dailyCache.get($sModalData.ticker);
		if (!dataStored) {
			dataStored = await fetchDaily($sModalData.ticker);
			if (!dataStored) {
				console.log('ERROR: failed to fetch `daily` data');
				loadingRequest = false;
				return;
			}
			dailyCache.set($sModalData.ticker, dataStored);
		}

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

	$: if ($sModalData.open) {
		openDialog();
	}
</script>

<Dialog.Root open={$sModalData.open} onOpenChange={() => ($sModalData.open = false)}>
	<Dialog.Content
		class={cn(
			'border border-blue-400 rounded-lg h-[100dvh] w-[100dvw] lg:h-[90%] lg:max-w-[90%]',
			'[&_.lucide-x]:text-blue-400',
			'[&_.lucide-x]:w-10',
			'[&_.lucide-x]:h-10'
		)}
		style=""
	>
		<Dialog.Header>
			<Dialog.Title class="text-sm sm:text-xl"
				>{$sModalData.ticker} - {$sModalData.name}</Dialog.Title
			>
			<Dialog.Description class="text-xs sm:text-lg"
				>Latest close price with KDJ indicator.
			</Dialog.Description>
			<Dialog.Description class="grid w-full h-full place-items-center">
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
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
