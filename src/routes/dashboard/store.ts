import { derived, writable } from 'svelte/store';

import type { TStock } from '$lib/server/types';

export type TStockPage = {
	kdj: number;
	sector: string;
	stock: TStock;
	tracked: boolean;
};

export const sModalData = writable({
	open: false,
	ticker: '',
	name: '',
	etf: false
});

export function createStoreStocks(initStocks: TStockPage[]) {
	const store = writable(initStocks);

	function addStocks(stocks: TStock[]) {
		store.update((oldStocks) => {
			// Check each new stock
			// if exists, do nothing
			// else, add as TStockPage object
			const newStocks: TStockPage[] = [];
			stocks.forEach((x) => {
				if (!oldStocks.some((xx) => xx.stock.ticker === x.ticker)) {
					newStocks.push({
						stock: x,
						kdj: 0,
						tracked: false,
						sector: x.sector
					});
				}
			});
			return [...oldStocks, ...newStocks];
		});
	}

	function getReadStocksScreen() {
		return derived(store, ($store) => $store.filter((x) => x.kdj !== 0));
	}

	function getReadStocksTracked() {
		return derived(store, ($store) => $store.filter((x) => x.tracked === true));
	}

	function getReadStocksSector(sector: string) {
		return derived(store, ($store) => {
			return $store
				.filter((x) => x.sector === sector)
				.sort((a, b) => a.stock.ranktotalcap - b.stock.ranktotalcap);
		});
	}

	function deleteByTicker(ticker: string) {
		store.update((stocks) => stocks.filter((s) => s.stock.ticker !== ticker));
	}

	function trackByStock(stock: TStockPage) {
		store.update((stocks) => {
			return stocks.map((s) => {
				if (s.stock.ticker === stock.stock.ticker) {
					s.tracked = true;
					return s;
				}
				return s;
			});
		});
	}

	function unTrackByStock(stock: TStockPage) {
		store.update((stocks) => {
			return stocks.map((s) => {
				if (s.stock.ticker === stock.stock.ticker) {
					s.tracked = false;
					return s;
				}
				return s;
			});
		});
	}

	return {
		...store,
		addStocks,
		getReadStocksScreen,
		getReadStocksTracked,
		getReadStocksSector,
		deleteByTicker,
		trackByStock,
		unTrackByStock
	};
}

export const stockStore = createStoreStocks([]);
