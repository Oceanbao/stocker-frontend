import { derived, writable } from 'svelte/store';

import type { TServerStock } from '$lib/server/types';

export const sModalData = writable({
	open: false,
	ticker: '',
	name: '',
	etf: false
});

export function createStoreStocks(initStocks: TServerStock[]) {
	const store = writable(initStocks);

	function addStocks(newStocks: TServerStock[]) {
		store.update((allStocks) => {
			newStocks.forEach((x) => {
				if (!allStocks.some((xx) => xx.ticker === x.ticker)) {
					allStocks.push(x);
				}
			});
			return allStocks;
		});
	}

	function getReadStock(ticker: string) {
		return derived(store, ($store) => $store.find((x) => x.ticker === ticker));
	}

	function getReadStocksScreen() {
		return derived(store, ($store) => $store.filter((x) => x.screenkdj >= 0));
	}

	function getReadStocksTracking() {
		return derived(store, ($store) => $store.filter((x) => x.tracking === true));
	}

	function getReadStocksSector(sector: string) {
		return derived(store, ($store) => {
			return $store
				.filter((x) => x.sector === sector)
				.sort((a, b) => a.ranktotalcap - b.ranktotalcap);
		});
	}

	function deleteByTicker(ticker: string) {
		store.update((stocks) => stocks.filter((s) => s.ticker !== ticker));
	}

	function trackByStock(stock: TServerStock) {
		store.update((stocks) => {
			return stocks.map((s) => {
				if (s.ticker === stock.ticker) {
					s.tracking = true;
					return s;
				}
				return s;
			});
		});
	}

	function unTrackByStock(stock: TServerStock) {
		store.update((stocks) => {
			return stocks.map((s) => {
				if (s.ticker === stock.ticker) {
					s.tracking = false;
					return s;
				}
				return s;
			});
		});
	}

	return {
		...store,
		addStocks,
		getReadStock,
		getReadStocksScreen,
		getReadStocksTracking,
		getReadStocksSector,
		deleteByTicker,
		trackByStock,
		unTrackByStock
	};
}

export const stockStore = createStoreStocks([]);

export const sActiveTab = writable<string>('');
export const sActiveSector = writable<string>('');
