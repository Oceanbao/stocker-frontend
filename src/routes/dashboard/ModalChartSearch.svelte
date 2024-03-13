<script lang="ts">
	import './modelchart.css';

	import { Loader2 } from 'lucide-svelte';

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

	export let openModalChart: boolean;
	export let activeStockServer: TServerStock;

	let candleData: TDaily[];
	let kdjData: TKdj[];
	let macdData: TMacd[];
	let sma5Data: TEma[];
	let sma20Data: TEma[];
	// let sma30Data: TEma[];
	// let sma90Data: TEma[];
	// let sma120Data: TEma[];
	let loadingRequest = true;

	$: if (openModalChart) loadData();

	async function loadData() {
		// Reset dialog states
		loadingRequest = true;

		const dailyData = await fetchDaily(activeStockServer.ticker);

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
</script>

<Dialog.Root open={openModalChart} onOpenChange={() => (openModalChart = false)}>
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
			<Dialog.Title class="text-sm lg:text-xl"
				>{activeStockServer.ticker} - {activeStockServer.name}</Dialog.Title
			>
			<Dialog.Description class="flex flex-wrap gap-2 [&_span]:text-xs lg:[&_span]:text-lg">
				<Badge variant="secondary" class="w-fit h-fit"
					>$ {(activeStockServer.dailyvalue / 100_000_000).toFixed(2)}</Badge
				>
				<Badge variant="secondary" class="w-fit h-fit"
					>{activeStockServer.sector} {activeStockServer.sectortotal}</Badge
				>
				<Badge variant="secondary" class="w-fit h-fit"
					>cap {(Math.pow(2, activeStockServer.tradecap) / 100_000_000).toFixed(
						2
					)}({activeStockServer.ranktotalcap})</Badge
				>
				<Badge variant="secondary" class="w-fit h-fit">eps {activeStockServer.eps.toFixed(2)}</Badge
				>
				<Badge variant="secondary" class="w-fit h-fit"
					>pe {activeStockServer.priceperearning / 100}({activeStockServer.rankper})</Badge
				>
				<Badge variant="secondary" class="w-fit h-fit"
					>roe {activeStockServer.roe.toFixed(2)}({activeStockServer.rankroe})</Badge
				>
				<Badge variant="secondary" class="w-fit h-fit">
					netp {(activeStockServer.netprofit / 100_000_000).toFixed(
						2
					)}({activeStockServer.ranknetprofit}-{activeStockServer.ranknetmargin})
				</Badge>
				<Badge variant="secondary" class="w-fit h-fit">
					gross {activeStockServer.grossprofitmargin.toFixed(
						2
					)}({activeStockServer.rankgrossmargin})
				</Badge>
				<Badge variant="secondary" class="w-fit h-fit">
					debt {activeStockServer.debtratio.toFixed(2)}
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
	</Dialog.Content>
</Dialog.Root>
