<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { type TStockPage, sModalData, stockStore } from './store';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	export let thenData;
	console.debug(thenData);

	const screenStocks = stockStore.getReadStocks();

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

<div class="grid place-items-center lg:max-w-6xl lg:mx-auto">
	<p>Total: {$screenStocks.length}</p>
	<Table.Root>
		<Table.Caption>Today's Screens</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Ticker</Table.Head>
				<Table.Head class="text-center">KDJ</Table.Head>
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
			{#each $screenStocks as stock (stock.stock.ticker)}
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
						<span class="absolute top-1 right-1 text-xs text-gray-600">kdj</span>
						<p>
							{Number(stock.kdj).toFixed(2)}
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">cap</span>
						<p>{(Math.pow(2, stock.stock.tradecap) / 100_000_000).toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">esp</span>
						<p>{stock.stock.eps.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">pe</span>
						<p>{stock.stock.priceperearning / 100}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">roe</span>
						<p>{stock.stock.roe.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">netp</span>
						<p>{(stock.stock.netprofit / 100_000_000).toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">gross</span>
						<p>{stock.stock.grossprofitmargin.toFixed(2)}</p>
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
							{#if loadingTrackStock === stock.stock.ticker}
								<Loader2 class="animate-spin" />
							{:else if stock.tracked}
								<p>untrack</p>
							{:else}
								<p>track</p>
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
