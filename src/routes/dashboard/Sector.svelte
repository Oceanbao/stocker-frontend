<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { type TStockPage, sModalData, stockStore } from './store';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { SECTORS } from './sectors';
	import type { Selected } from 'bits-ui';

	export const thenData = undefined;

	let sector = SECTORS[0];
	let sectorFetched = [SECTORS[0]];
	let loadingSectorData = false;

	$: sectorStocks = stockStore.getReadStocksSector(sector);

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

	async function changeSectorHandler(v: Selected<string | unknown> | undefined) {
		loadingSectorData = true;
		if (v) {
			const sectorSelected = v.value as string;

			if (sectorFetched.includes(sectorSelected)) {
				console.log(sectorFetched);
				sector = sectorSelected;
				return;
			}

			sectorFetched = [...sectorFetched, sectorSelected];

			const baseUrl = '/api/sector';
			const resp = await fetch(`${baseUrl}?sector=${sectorSelected}`, {
				method: 'GET'
			});
			try {
				const body = await resp.json();
				if (body.message !== 'error') {
					// NOTE: important place and steps to make deletion takes affect.
					// FIXME: better shape
					stockStore.addStocks(body.data.data);
				}
			} catch (err) {
				console.log(err);
			}

			sector = sectorSelected;
		}
		loadingSectorData = false;
	}
</script>

<div class="grid place-items-center lg:max-w-7xl lg:mx-auto">
	<p>{sector} ({$sectorStocks.length})</p>
	<Select.Root preventScroll={false} onSelectedChange={(v) => changeSectorHandler(v)}>
		<Select.Trigger>
			<Select.Value placeholder={sector} />
		</Select.Trigger>
		<Select.Content>
			{#each SECTORS as s}
				<Select.Item value={s} label={s}>{s}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Table.Root class={`${loadingSectorData ? 'blur-sm pointer-events-none' : ''}`}>
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
				<Table.Row
					class={loadingTrackStock === stock.stock.ticker ||
					loadingDeleteStock === stock.stock.ticker
						? 'blur-sm pointer-events-none'
						: ''}
				>
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
