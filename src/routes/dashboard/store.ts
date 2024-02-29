import { writable } from 'svelte/store';

export const sModalData = writable({
	open: false,
	ticker: '',
	name: '',
	etf: false
});

export const sDeletedStocks = writable<string[]>([]);
export const sTrackedStocks = writable<string[]>([]);
