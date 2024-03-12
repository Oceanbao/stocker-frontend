import Pocketbase from 'pocketbase';

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export type { ClientResponseError } from 'pocketbase';

export function createPB() {
	return new Pocketbase(dev ? 'http://127.0.0.1:8080' : env.PB_URL);
}
