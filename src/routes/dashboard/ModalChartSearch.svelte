<script lang="ts">
	import './modelchart.css';

	import { Heart, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import {
		computeKDJ,
		computeMACD,
		computeSMA,
		type TDaily,
		type TEma,
		type TKdj,
		type TMacd
	} from '$lib/charts';
	import ChartStock from '$lib/components/ChartStock.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { TServerStock } from '$lib/server/types';
	import { cn } from '$lib/utils';

	import { stockStore } from './store';

	export let openModalChart: boolean;
	export let serverStock: TServerStock;

	let candleData: TDaily[];
	let kdjData: TKdj[];
	let macdData: TMacd[];
	let sma5Data: TEma[];
	let sma20Data: TEma[];
	// let sma30Data: TEma[];
	// let sma90Data: TEma[];
	// let sma120Data: TEma[];
	let loadingRequest = true;
	let activeStockLocal: TServerStock | undefined;

	$: if (openModalChart) loadData();
	$: activeStockLocal = $stockStore.find((x) => x.ticker === serverStock?.ticker);

	async function loadData() {
		// Reset dialog states
		loadingRequest = true;

		const stockExisted = $stockStore.find((x) => x.ticker === serverStock?.ticker);
		if (!stockExisted) {
			serverStock = { ...serverStock, tracking: true };
			stockStore.addStocks([serverStock], 'tracking');
		} else {
			activeStockLocal = stockExisted;
		}

		const dailyData = await fetchDaily(serverStock.ticker);

		//TODO: could improve by cahcing these.
		candleData = dailyData?.map((x: Record<string, string>) => ({
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

	async function trackStockHandler(stock: TServerStock) {
		if (stock.tracking) {
			toast.promise(unTrackStock(stock), {
				loading: 'Untracking...',
				success: (data) => {
					return `ticker ${stock.ticker} untracked (${JSON.stringify(data)})`;
				},
				error: (err) => {
					return `Error: ${JSON.stringify(err)}`;
				}
			});
		} else {
			toast.promise(trackStock(stock), {
				loading: 'tracking...',
				success: (data) => {
					return `ticker ${stock.ticker} tracked (${JSON.stringify(data)})`;
				},
				error: (err) => {
					return `Error: ${JSON.stringify(err)}`;
				}
			});
		}
	}

	async function trackStock(stock: TServerStock) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${stock.ticker}`, {
			method: 'POST'
		});
		try {
			const body = await resp.json();
			//FIXME: need to revamp and cleanup how API communicates.
			if (body.message !== 'error') {
				stockStore.trackByStock(stock);
				return Promise.resolve(body.data);
			}
			return Promise.reject(body.error);
		} catch (err) {
			return Promise.reject(err);
		}
	}

	async function unTrackStock(stock: TServerStock) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${stock.ticker}`, {
			method: 'DELETE'
		});
		try {
			const body = await resp.json();
			if (body.message !== 'error') {
				// NOTE: important place and steps to make deletion takes affect.
				stockStore.unTrackByStock(stock);
				return Promise.resolve(body.data);
			}
			return Promise.reject(body.error);
		} catch (err) {
			return Promise.reject(err);
		}
	}
</script>

<Dialog.Root open={openModalChart} onOpenChange={() => (openModalChart = false)}>
	<Dialog.Content
		class={cn(
			'flex flex-col border border-blue-400 rounded-lg h-[100dvh] w-[100dvw] lg:h-[90%] lg:max-w-[90%]',
			'[&_.lucide-x]:text-blue-400',
			'[&_.lucide-x]:w-10',
			'[&_.lucide-x]:h-10'
		)}
	>
		{#if activeStockLocal}
			<Dialog.Header>
				<Dialog.Title class="flex gap-2 text-sm lg:text-xl">
					<span>{activeStockLocal.ticker} - {activeStockLocal.name}</span>
					<button
						tabindex={-1}
						on:click={() => {
							if (activeStockLocal) trackStockHandler(activeStockLocal);
						}}
					>
						<Heart fill={`${activeStockLocal.tracking ? 'red' : ''}`} size="1rem" />
					</button>
				</Dialog.Title>
				<Dialog.Description class="flex flex-wrap gap-2 [&_span]:text-xs lg:[&_span]:text-lg">
					<Badge variant="secondary" class="w-fit h-fit"
						>$ {(activeStockLocal.dailyvalue / 100_000_000).toFixed(2)}</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>{activeStockLocal.sector} {activeStockLocal.sectortotal}</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>cap {(Math.pow(2, activeStockLocal.tradecap) / 100_000_000).toFixed(
							2
						)}({activeStockLocal.ranktotalcap})</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>eps {activeStockLocal.eps.toFixed(2)}</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>pe {activeStockLocal.priceperearning / 100}({activeStockLocal.rankper})</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit"
						>roe {activeStockLocal.roe.toFixed(2)}({activeStockLocal.rankroe})</Badge
					>
					<Badge variant="secondary" class="w-fit h-fit">
						netp {(activeStockLocal.netprofit / 100_000_000).toFixed(
							2
						)}({activeStockLocal.ranknetprofit}-{activeStockLocal.ranknetmargin})
					</Badge>
					<Badge variant="secondary" class="w-fit h-fit">
						gross {activeStockLocal.grossprofitmargin.toFixed(
							2
						)}({activeStockLocal.rankgrossmargin})
					</Badge>
					<Badge variant="secondary" class="w-fit h-fit">
						debt {activeStockLocal.debtratio.toFixed(2)}
					</Badge>
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
		{/if}
	</Dialog.Content>
</Dialog.Root>
