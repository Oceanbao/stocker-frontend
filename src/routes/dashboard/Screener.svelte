<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { type TStockPage, sModalData, stockStore } from './store';
	import { toast } from 'svelte-sonner';
	import type { TScreen } from '$lib/server/types';

	export let thenData: TScreen[];

	const screenStocks = stockStore.getReadStocksScreen();

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
	}

	async function trackStock(stock: TStockPage) {
		loadingTrackStock = stock.stock.ticker;
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${stock.stock.ticker}`, {
			method: 'POST'
		});
		loadingTrackStock = '';
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
		} finally {
			loadingTrackStock = '';
		}
	}

	async function unTrackStock(stock: TStockPage) {
		loadingTrackStock = stock.stock.ticker;
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
		} finally {
			loadingTrackStock = '';
		}
	}
</script>

<div class="grid place-items-center lg:max-w-7xl lg:mx-auto">
	<p>Total: {$screenStocks.length}</p>
	<Table.Root>
		<Table.Caption>Today's Screens</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Ticker</Table.Head>
				<Table.Head class="text-center">Value</Table.Head>
				<Table.Head class="text-center">Sector / Total</Table.Head>
				<Table.Head class="text-center">Cap</Table.Head>
				<Table.Head class="text-center">EPS ($)</Table.Head>
				<Table.Head class="text-center">PER</Table.Head>
				<Table.Head class="text-center">ROE (%)</Table.Head>
				<Table.Head class="text-center">Net Profit</Table.Head>
				<Table.Head class="text-center">Gross (%)</Table.Head>
				<Table.Head class="text-center">Debt (%)</Table.Head>
				<Table.Head class="text-center">Track</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $screenStocks as stock (stock.stock.ticker)}
				<Table.Row
					class={loadingTrackStock === stock.stock.ticker ||
					loadingDeleteStock === stock.stock.ticker
						? 'blur-sm pointer-events-none'
						: ''}
				>
					<Table.Cell class="font-medium relative">
						<Button
							variant="destructive"
							on:click={() => deleteStock(stock.stock.ticker)}
							disabled={loadingDeleteStock === stock.stock.ticker}
							class="absolute top-0 left-0 size-0 text-xs"
						>
							X
						</Button>
						<span class="absolute top-1 right-1 text-xs text-gray-600">{stock.kdj.toFixed(2)}</span>
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
						<span class="absolute top-1 right-1 text-xs text-gray-600">$</span>
						{@const val = thenData.find((x) => x.stock.ticker === stock.stock.ticker)}
						{#if val}
							<p>{(val.daily.value / 100_000_000).toFixed(2)}</p>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">sec</span>
						<p class="text-xs">
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
						<Button
							variant="default"
							on:click={() => trackStockHandler(stock)}
							disabled={loadingTrackStock === stock.stock.ticker}
							class="w-full"
						>
							{#if stock.tracked}
								<p>untrack</p>
							{:else}
								<p>track</p>
							{/if}
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
