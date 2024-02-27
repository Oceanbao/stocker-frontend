import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { writable } from 'svelte/store';

import Pocketbase from 'pocketbase';

export type { ClientResponseError } from 'pocketbase';

export function createPB() {
	return new Pocketbase(dev ? 'http://127.0.0.1:8080' : env.PB_URL);
}

export const pb = createPB();

export const currentUser = writable<typeof pb.authStore.model>(pb.authStore.model);

pb.authStore.onChange((auth) => {
	console.log('authStore changed', auth);
	currentUser.set(pb.authStore.model);
});
