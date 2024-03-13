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

	function addStocks(newStocks: TServerStock[], type: 'screener' | 'tracking' | 'sector') {
		console.log(type);
		console.log(newStocks.length);
		// TODO: someday fix this shit!
		if (type === 'screener') {
			store.update((allStocks) => {
				newStocks.forEach((newS) => {
					const oldIndex = allStocks.findIndex((oldS) => oldS.ticker === newS.ticker);
					if (oldIndex === -1) {
						// Not found, push.
						allStocks.push(newS);
					} else {
						// Found, replace.
						allStocks[oldIndex] = newS;
					}
				});
				return allStocks;
			});
			return;
		}

		store.update((allStocks) => {
			newStocks.forEach((newS) => {
				const existedStock = allStocks.find((oldS) => oldS.ticker === newS.ticker);
				if (!existedStock) {
					allStocks.push(newS);
				}
			});
			return allStocks;
		});
	}

	function getReadStock(ticker: string) {
		return derived(store, ($store) => $store.find((x) => x.ticker === ticker));
	}

	function getReadStocksScreen() {
		return derived(store, ($store) => $store.filter((x) => x.screenkdj !== undefined));
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
