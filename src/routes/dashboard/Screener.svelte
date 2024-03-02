<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { sModalData, sDeletedStocks, sTrackedStocks } from './store';
	import { Loader2 } from 'lucide-svelte';
	import { removeItem } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	const demoRecord = {
		daily: {
			ticker: '0.002002',
			date: '2024-01-18 00:00:00.000Z',
			open: 0.58,
			high: 0.58,
			low: 0.58,
			close: 0.58,
			volume: 107356,
			value: 6226648,
			volatility: 0,
			pchange: -4.92,
			change: -0.03,
			turnover: 0.35
		},
		kdj: -6.891942183880124,
		stock: {
			ticker: '0.002002',
			name: 'ST鸿达',
			etf: false,
			dateofpublic: '2004-06-25 00:00:00.000Z',
			eps: -0.260596738,
			undistprofit: 1.020851040433,
			totalshare: 3122077654,
			totalshareout: 3100241618,
			totcalcap: 30.75398408059069,
			tradecap: 30.743858315969803,
			netasset: 32.34032787742531,
			netassetpershare: 3.0028737,
			netprofit: -813603253.1,
			netprofitchange: -383.339950003408,
			profitmargin: -36.9186130876,
			priceperearning: -167,
			priceperbook: 19,
			roe: -8.25,
			totalrevenue: 2219816266.08,
			totalrevenuechange: -42.0418071432,
			grossprofitmargin: -3.9941810651,
			debtratio: 48.5783103042
		}
	};

	export let records: (typeof demoRecord)[];

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

		toast.dismiss(loadingToast);
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
			return;
		}

		toast.promise(trackStock(ticker), {
			loading: 'Tracking...',
			success: (data) => {
				return `ticker ${ticker} tracked (${JSON.stringify(data)})`;
			},
			error: (err) => {
				return `Error: ${JSON.stringify(err)}`;
			}
		});
	}

	async function trackStock(ticker: string) {
		const baseUrl = '/api/track';
		const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
			method: 'POST'
		});
		//FIXME: the location of this is vital, fix this.
		loadingTrackStock = '';
		try {
			const body = await resp.json();
			//FIXME: need to revamp and cleanup how API communicates.
			if (body.message !== 'error') {
				// NOTE: important place and steps to make deletion takes affect.
				$sTrackedStocks.push(ticker);
				// FIXME:
				document.querySelector(`tr p[data-tracking='${ticker}']`)?.classList.add('text-red-500');
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
		loadingTrackStock = '';
		try {
			const body = await resp.json();
			if (body.message !== 'error') {
				// NOTE: important place and steps to make deletion takes affect.
				$sTrackedStocks = removeItem($sTrackedStocks, ticker);
				// FIXME:
				document.querySelector(`tr p[data-tracking='${ticker}']`)?.classList.remove('text-red-500');
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
				<Table.Head class="text-center">TradedCap</Table.Head>
				<Table.Head class="text-center">NAPS</Table.Head>
				<Table.Head class="text-center">NetProfit</Table.Head>
				<Table.Head class="text-center">Turnover (%)</Table.Head>
				<Table.Head class="text-center">EPS ($)</Table.Head>
				<Table.Head class="text-center">PER</Table.Head>
				<Table.Head class="text-center">ROE (%)</Table.Head>
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
							<p
								class={`${$sTrackedStocks.includes(record.stock.ticker) ? 'text-red-500' : ''}`}
								data-tracking={record.stock.ticker}
							>
								{record.stock.name}
							</p>
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right">{record.kdj.toFixed(2)}</Table.Cell>
					<Table.Cell class="text-right"
						>{(Math.pow(2, record.stock.tradecap) / 100_000_000).toFixed(2)}</Table.Cell
					>
					<Table.Cell class="text-right">{record.stock.netassetpershare.toFixed(2)}</Table.Cell>
					<Table.Cell class="text-right"
						>{(record.stock.netprofit / 100_000_000).toFixed(2)}</Table.Cell
					>
					<Table.Cell class="text-right">{record.daily.turnover.toFixed(2)}</Table.Cell>
					<Table.Cell class="text-right">{record.stock.eps.toFixed(2)}</Table.Cell>
					<Table.Cell class="text-right">{record.stock.priceperearning / 100}</Table.Cell>
					<Table.Cell class="text-right">{record.stock.roe.toFixed(2)}</Table.Cell>
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
