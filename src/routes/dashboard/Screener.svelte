<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { sModalData } from './store';

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

	function openDialog(ticker: string, name: string) {
		$sModalData.ticker = ticker;
		$sModalData.name = name;
		$sModalData.open = true;
	}

	// records = records.map((x) => ({ code: x.code, rsi: x.rsi, name: x.name, cap: x.cap }));
	// records.sort((a, b) => (a.cap > b.cap ? -1 : b.cap > a.cap ? 1 : 0));
</script>

<div class="grid place-items-center lg:max-w-3xl lg:mx-auto">
	<p>Total: {records.length}</p>
	<Table.Root>
		<Table.Caption>Today's Screens</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Ticker</Table.Head>
				<Table.Head class="text-center">KDJ</Table.Head>
				<Table.Head class="text-center">Turnover (%)</Table.Head>
				<Table.Head class="text-center">EPS ($)</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each records as record, idx}
				<Table.Row data-index={idx}>
					<Table.Cell class="font-medium">
						<Button
							variant="secondary"
							class="w-[100px]"
							on:click={() => openDialog(record.stock.ticker, record.stock.name)}
						>
							{record.stock.name}
						</Button>
					</Table.Cell>
					<Table.Cell class="text-right">{record.kdj.toFixed(4)}</Table.Cell>
					<Table.Cell class="text-right">{record.daily.turnover.toFixed(4)}</Table.Cell>
					<Table.Cell class="text-right">{record.stock.eps.toFixed(4)}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
