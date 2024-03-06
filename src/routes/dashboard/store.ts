import { derived, writable } from 'svelte/store';

import type { TStock } from '$lib/server/types';

export type TStockPage = {
	kdj: number;
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

	function getReadStocks() {
		return derived(store, ($store) => $store.filter((x) => x.kdj !== 0));
	}

	function getReadStocksTracked() {
		return derived(store, ($store) => $store.filter((x) => x.tracked === true));
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
		getReadStocks,
		getReadStocksTracked,
		deleteByTicker,
		trackByStock,
		unTrackByStock
	};
}

export const stockStore = createStoreStocks([]);
