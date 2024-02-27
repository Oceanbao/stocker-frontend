<script lang="ts">
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

	// const submitTrackAction: SubmitFunction = (event) => {
	// 	loadingTrackAction = true;

	// 	event.formData.set('ticker', $sModalData.ticker);
	// 	event.formData.set('name', $sModalData.name);

	// 	return async ({ result }) => {
	// 		// await update();
	// 		switch (result.type) {
	// 			case 'success':
	// 				console.log(result.data);
	// 				thisStockTracked = true;
	// 				if (result.data) {
	// 					const newTracked = {
	// 						...result.data.data,
	// 						change: 0
	// 					};
	// 					$sTrackData = [...$sTrackData, newTracked];
	// 					actionResult = 'Tracking stock successful.';
	// 				} else {
	// 					actionResult = 'Unexpected missing data but action successful.';
	// 				}
	// 				await applyAction(result);
	// 				break;
	// 			case 'failure':
	// 				console.log(result.data);
	// 				actionResult = result.data?.message;
	// 				break;
	// 			case 'error':
	// 				console.log(result.error);
	// 				actionResult = result.error?.message;
	// 				break;
	// 			default:
	// 				console.log('Unexpected action result.');
	// 				actionResult = 'Unexpected action result.';
	// 		}
	// 		loadingTrackAction = false;
	// 	};
	// };
</script>

<Dialog.Root open={$sModalData.open} onOpenChange={() => ($sModalData.open = false)}>
	<Dialog.Content
		class={cn(
			'border border-blue-400 rounded-lg h-[70vh] w-[95vw] lg:h-[80%] lg:max-w-[80%] auto-rows-auto overflow-y-auto',
			'[&_.lucide-x]:text-blue-400',
			'[&_.lucide-x]:w-10',
			'[&_.lucide-x]:h-10'
		)}
	>
		<Dialog.Header>
			<Dialog.Title class="text-sm sm:text-xl">{$sModalData.ticker} {$sModalData.name}</Dialog.Title
			>
			<Dialog.Description class="text-xs sm:text-lg"
				>Latest close price with RSI indicator.</Dialog.Description
			>
			<!-- {#if $sModalData.trackable} -->
			<!-- 	<form method="POST" action="?/track" use:enhance={submitTrackAction} class="flex flex-col"> -->
			<!-- 		<Button -->
			<!-- 			variant="ghost" -->
			<!-- 			class="bg-blue-600 text-white self-center h-6 w-20 sm:w-20 sm:h-8 sm:self-end md:mt-4" -->
			<!-- 			disabled={thisStockTracked} -->
			<!-- 		> -->
			<!-- 			{#if loadingTrackAction} -->
			<!-- 				<Loader2 class="animate-spin" /> -->
			<!-- 			{/if} -->
			<!-- 			{#if thisStockTracked} -->
			<!-- 				Tracking -->
			<!-- 			{:else} -->
			<!-- 				Track -->
			<!-- 			{/if} -->
			<!-- 		</Button> -->
			<!-- 		{#if actionResult} -->
			<!-- 			<span class="text-red-500">{actionResult}</span> -->
			<!-- 		{/if} -->
			<!-- 	</form> -->
			<!-- {/if} -->
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
		<!-- <div class="grid gap-4 py-4"> -->
		<!-- 	<div class="grid grid-cols-4 items-center gap-4"> -->
		<!-- 		<Label class="text-right">Name</Label> -->
		<!-- 		<Input id="name" value="Pedro Duarte" class="col-span-3" /> -->
		<!-- 	</div> -->
		<!-- 	<div class="grid grid-cols-4 items-center gap-4"> -->
		<!-- 		<Label class="text-right">Username</Label> -->
		<!-- 		<Input id="username" value="@peduarte" class="col-span-3" /> -->
		<!-- 	</div> -->
		<!-- </div> -->
		<!-- <Dialog.Footer> -->
		<!-- 	<Button type="submit">Save changes</Button> -->
		<!-- </Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>
