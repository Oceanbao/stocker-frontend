<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { type TStock, sModalData, sDeletedStocks, sTrackedStocks } from './store';
	import { Loader2 } from 'lucide-svelte';
	import { removeItem } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	export let records: TStock[];

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
				// NOTE: important place and steps to make deletion takes affect.
				$sDeletedStocks.push(ticker);
				records = records.filter((x) => !$sDeletedStocks.includes(x.stock.ticker));
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

	async function trackStockHandler(ticker: string) {
		loadingTrackStock = ticker;

		if ($sTrackedStocks.includes(ticker)) {
			toast.promise(unTrackStock(ticker), {
				loading: 'Untracking...',
				success: (data) => {
					return `ticker ${ticker} untracked (${JSON.stringify(data)})`;
				},
				error: (err) => {
					return `Error: ${JSON.stringify(err)}`;
				}
			});
		} else {
			toast.promise(trackStock(ticker), {
				loading: 'tracking...',
				success: (data) => {
					return `ticker ${ticker} tracked (${JSON.stringify(data)})`;
				},
				error: (err) => {
					return `Error: ${JSON.stringify(err)}`;
				}
			});
		}

		loadingTrackStock = '';
	}

	async function trackStock(ticker: string) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
			method: 'POST'
		});
		try {
			const body = await resp.json();
			//FIXME: need to revamp and cleanup how API communicates.
			if (body.message !== 'error') {
				$sTrackedStocks = [...$sTrackedStocks, ticker];
				return Promise.resolve(body.data);
			}
			return Promise.reject(body.error);
		} catch (err) {
			return Promise.reject(err);
		}
	}

	async function unTrackStock(ticker: string) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
			method: 'DELETE'
		});
		try {
			const body = await resp.json();
			if (body.message !== 'error') {
				// NOTE: important place and steps to make deletion takes affect.
				$sTrackedStocks = removeItem($sTrackedStocks, ticker);
				return Promise.resolve(body.data);
			}
			return Promise.reject(body.error);
		} catch (err) {
			return Promise.reject(err);
		}
	}
</script>

<div class="grid place-items-center lg:max-w-6xl lg:mx-auto">
	<p>Total: {records.length}</p>
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
			{#each records as record (record.stock.ticker)}
				<Table.Row>
					<Table.Cell class="font-medium">
						<Button
							variant="secondary"
							class="w-[100px]"
							on:click={() => openDialog(record.stock.ticker, record.stock.name)}
						>
							<p class={`${$sTrackedStocks.includes(record.stock.ticker) ? 'text-red-500' : ''}`}>
								{record.stock.name}
							</p>
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">kdj</span>
						<p>
							{record.kdj.toFixed(2)}
						</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">cap</span>
						<p>{(Math.pow(2, record.stock.tradecap) / 100_000_000).toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">esp</span>
						<p>{record.stock.eps.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">pe</span>
						<p>{record.stock.priceperearning / 100}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">roe</span>
						<p>{record.stock.roe.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">netp</span>
						<p>{(record.stock.netprofit / 100_000_000).toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">gross</span>
						<p>{record.stock.grossprofitmargin.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right relative">
						<span class="absolute top-1 right-1 text-xs text-gray-600">debt</span>
						<p>{record.stock.debtratio.toFixed(2)}</p>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button
							variant="default"
							on:click={() => trackStockHandler(record.stock.ticker)}
							disabled={loadingTrackStock === record.stock.ticker}
							class="w-full"
						>
							{#if loadingTrackStock === record.stock.ticker}
								<Loader2 class="animate-spin" />
							{:else}
								<p>track</p>
							{/if}
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button
							variant="destructive"
							on:click={() => deleteStock(record.stock.ticker)}
							disabled={loadingDeleteStock === record.stock.ticker}
							class="w-full"
						>
							{#if loadingDeleteStock === record.stock.ticker}
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
