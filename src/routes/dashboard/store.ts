import { derived, writable } from 'svelte/store';

const demoStock = {
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
};

type TStockType = 'SCREEN' | 'TRACK';

export type TStock = {
	kdj: string;
	stock: typeof demoStock;
	type: TStockType;
};

export const sModalData = writable({
	open: false,
	ticker: '',
	name: '',
	etf: false
});

export const sTrackAndScreenStocks = writable<TStock[]>([]);

export const sScreenStocks = derived(sTrackAndScreenStocks, ($sTrackAndScreenStocks) =>
	$sTrackAndScreenStocks.filter((x) => x.type === 'SCREEN')
);

export const sTrackStocks = derived(sTrackAndScreenStocks, ($sTrackAndScreenStocks) =>
	$sTrackAndScreenStocks.filter((x) => x.type === 'SCREEN')
);
