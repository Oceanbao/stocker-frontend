<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { type TStockPage, sModalData, stockStore } from './store';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	const SECTORS = [
		'食品饮料',
		'农牧饲渔',
		'玻璃玻纤',
		'仪器仪表',
		'石油行业',
		'医疗服务',
		'光伏设备',
		'软件开发',
		'航空机场',
		'电源设备',
		'农药兽药',
		'交运设备',
		'汽车零部件',
		'通用设备',
		'汽车服务',
		'包装材料',
		'装修装饰',
		'环保行业',
		'家电行业',
		'化学制品',
		'旅游酒店',
		'通信服务',
		'文化传媒',
		'房地产开发',
		'造纸印刷',
		'塑料制品',
		'电子化学品',
		'半导体',
		'化肥行业',
		'采掘行业',
		'珠宝首饰',
		'酿酒行业',
		'电力行业',
		'物流行业',
		'化学原料',
		'非金属材料',
		'美容护理',
		'电机',
		'消费电子',
		'光学光电子',
		'专业服务',
		'公用事业',
		'贸易行业',
		'保险',
		'贵金属',
		'电网设备',
		'船舶制造',
		'铁路公路',
		'游戏',
		'专用设备',
		'证券',
		'装修建材',
		'工程机械',
		'生物制品',
		'家用轻工',
		'纺织服装',
		'中药',
		'多元金融',
		'综合行业',
		'工程咨询服务',
		'医疗器械',
		'钢铁行业',
		'医药商业',
		'燃气',
		'煤炭行业',
		'汽车整车',
		'工程建设',
		'银行',
		'互联网服务',
		'航天航空',
		'化纤行业',
		'能源金属',
		'电池',
		'通信设备',
		'小金属',
		'水泥建材',
		'商业百货',
		'风电设备',
		'计算机设备',
		'化学制药',
		'电子元件',
		'航运港口',
		'有色金属',
		'橡胶制品',
		'教育'
	];

	export const thenData = undefined;

	let sector = SECTORS[0];

	const sectorStocks = stockStore.getReadStocksSector(sector);

	let loadingTrackStock = '';
	let loadingDeleteStock = '';

	function openDialog(ticker: string, name: string) {
		$sModalData.ticker = ticker;
		$sModalData.name = name;
		$sModalData.open = true;
	}

	async function deleteStock(ticker: string) {
		loadingDeleteStock = ticker;
		const loadingToast = toast.loading(`Deleting '${ticker}' and all its data.`);

		const baseUrl = '/api/stock';
		const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
			method: 'DELETE'
		});

		try {
			const body = await resp.json();
			if (body.message !== 'error') {
				stockStore.deleteByTicker(ticker);
				toast.success(`Deleted '${ticker}'`);
			} else {
				toast.error(`Error: ${body.error}`);
			}
		} catch (err) {
			toast.error(`Error: ${err}`);
		} finally {
			loadingDeleteStock = '';
			toast.dismiss(loadingToast);
		}
	}

	async function trackStockHandler(stock: TStockPage) {
		loadingTrackStock = stock.stock.ticker;

		if (stock.tracked) {
			toast.promise(unTrackStock(stock), {
				loading: 'Untracking...',
				success: (data) => {
					return `ticker ${stock.stock.ticker} untracked (${JSON.stringify(data)})`;
				},
				error: (err) => {
					return `Error: ${JSON.stringify(err)}`;
				}
			});
		} else {
			toast.promise(trackStock(stock), {
				loading: 'tracking...',
				success: (data) => {
					return `ticker ${stock.stock.ticker} tracked (${JSON.stringify(data)})`;
				},
				error: (err) => {
					return `Error: ${JSON.stringify(err)}`;
				}
			});
		}

		loadingTrackStock = '';
	}

	async function trackStock(stock: TStockPage) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${stock.stock.ticker}`, {
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

	async function unTrackStock(stock: TStockPage) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${stock.stock.ticker}`, {
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

<div class="grid place-items-center lg:max-w-7xl lg:mx-auto">
	<p>{sector} ({$sectorStocks.length})</p>
	<Table.Root>
		<Table.Caption>Sector Stocks</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Ticker</Table.Head>
				<Table.Head class="text-center">Sector / Total</Table.Head>
				<Table.Head class="text-center">Cap</Table.Head>
				<Table.Head class="text-center">EPS ($)</Table.Head>
				<Table.Head class="text-center">PER</Table.Head>
				<Table.Head class="text-center">ROE (%)</Table.Head>
				<Table.Head class="text-center">Net Profit</Table.Head>
				<Table.Head class="text-center">Gross (%)</Table.Head>
				<Table.Head class="text-center">Debt (%)</Table.Head>
				<Table.Head class="text-center">Track</Table.Head>
				<Table.Head class="text-center">Dele</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $sectorStocks as stock (stock.stock.ticker)}
				<Table.Row>
					<Table.Cell class="font-medium">
						<Button
							variant="secondary"
							class="w-[100px]"
							on:click={() => openDialog(stock.stock.ticker, stock.stock.name)}
						>
							<p class={`${stock.tracked ? 'text-red-500' : ''}`}>
								{stock.stock.name}
							</p>
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">sec</span>
						<p>
							{stock.stock.sector} ({stock.stock.sectortotal})
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">cap</span>
						<p>
							{(Math.pow(2, stock.stock.tradecap) / 100_000_000).toFixed(2)} ({stock.stock
								.ranktotalcap})
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">eps</span>
						<p>{stock.stock.eps.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">pe</span>
						<p>{stock.stock.priceperearning / 100} ({stock.stock.rankper})</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">roe</span>
						<p>{stock.stock.roe.toFixed(2)} ({stock.stock.rankroe})</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">netp</span>
						<p>
							{(stock.stock.netprofit / 100_000_000).toFixed(2)} ({stock.stock.ranknetprofit}-{stock
								.stock.ranknetmargin})
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">gross</span>
						<p>{stock.stock.grossprofitmargin.toFixed(2)} ({stock.stock.rankgrossmargin})</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">debt</span>
						<p>{stock.stock.debtratio.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button variant="default" on:click={() => trackStockHandler(stock)} class="w-full">
							{#if loadingTrackStock === stock.stock.ticker}
								<Loader2 class="animate-spin" />
							{:else}
								<p>untrack</p>
							{/if}
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button
							variant="destructive"
							on:click={() => deleteStock(stock.stock.ticker)}
							disabled={loadingDeleteStock === stock.stock.ticker}
							class="w-full"
						>
							{#if loadingDeleteStock === stock.stock.ticker}
								<Loader2 class="animate-spin" />
							{:else}
								<p>delete</p>
							{/if}
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
