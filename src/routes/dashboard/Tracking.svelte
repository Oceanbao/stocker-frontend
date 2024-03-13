<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { Heart, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import type { TServerStock } from '$lib/server/types';

	import { sModalData, stockStore } from './store';

	export let thenData: TServerStock[];

	stockStore.addStocks(thenData, 'tracking');
	const trackStocks = stockStore.getReadStocksTracking();

	let loadingTrackStock = '';
	let loadingDeleteStock = '';
	let openModal = false;

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

	async function trackStockHandler(stock: TServerStock) {
		toast.promise(unTrackStock(stock), {
			loading: 'Untracking...',
			success: (data) => {
				return `ticker ${stock.ticker} untracked (${JSON.stringify(data)})`;
			},
			error: (err) => {
				return `Error: ${JSON.stringify(err)}`;
			}
		});
	}

	async function unTrackStock(stock: TServerStock) {
		loadingTrackStock = stock.ticker;
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
		} finally {
			loadingTrackStock = '';
		}
	}

	function openModalHandler() {
		openModal = !openModal;
	}
</script>

<Dialog.Root open={openModal}>
	<Dialog.Content class="border border-blue-400 rounded-lg">
		<div class="grid grid-cols-5 gap-4">
			{#each $trackStocks as stock (stock.ticker)}
				<div>{stock.name}<br />{stock.ticker}</div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>

<div class="grid place-items-center lg:max-w-7xl lg:mx-auto">
	<p>Total: {$trackStocks.length}</p>
	<Button variant="secondary" class="hidden md:flex w-[100px]" on:click={openModalHandler}>
		<p>Open Modal</p>
	</Button>
	<Table.Root>
		<Table.Caption>Tracked stocks</Table.Caption>
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
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $trackStocks as stock (stock.ticker)}
				<Table.Row
					class={loadingTrackStock === stock.ticker || loadingDeleteStock === stock.ticker
						? 'blur-sm pointer-events-none'
						: ''}
				>
					<Table.Cell class="font-medium relative">
						<div class="absolute top-0 left-0 flex gap-2">
							<button on:click={() => deleteStock(stock.ticker)}>
								<Trash2 color="white" size="1rem" />
							</button>

							<button on:click={() => trackStockHandler(stock)}>
								<Heart fill={`${stock.tracking ? 'red' : ''}`} size="1rem" />
							</button>
						</div>

						<Button
							variant="secondary"
							class="w-[100px]"
							on:click={() => openDialog(stock.ticker, stock.name)}
						>
							<p class={`${stock.tracking ? 'text-red-500' : ''}`}>
								{stock.name}
							</p>
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">sec</span>
						<p>
							{stock.sector} ({stock.sectortotal})
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">cap</span>
						<p>
							{(Math.pow(2, stock.tradecap) / 100_000_000).toFixed(2)} ({stock.ranktotalcap})
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">eps</span>
						<p>{stock.eps.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">pe</span>
						<p>{stock.priceperearning / 100} ({stock.rankper})</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">roe</span>
						<p>{stock.roe.toFixed(2)} ({stock.rankroe})</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">netp</span>
						<p>
							{(stock.netprofit / 100_000_000).toFixed(2)} ({stock.ranknetprofit}-{stock.ranknetmargin})
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">gross</span>
						<p>{stock.grossprofitmargin.toFixed(2)} ({stock.rankgrossmargin})</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">debt</span>
						<p>{stock.debtratio.toFixed(2)}</p>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
