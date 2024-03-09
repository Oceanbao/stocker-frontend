import { SECTORS } from '$lib/server/sectors';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user;

	//TODO: better handle err at frontend - USE ZOD
	const recordsScreen = event.locals.pb
		?.send('/screen', { method: 'GET' })
		.then((r) => r.data)
		.catch((err) => {
			return { ...err };
		});

	const recordsTracking = event.locals.pb
		?.send('/tracking', { method: 'GET' })
		.then((r) => r.data)
		.catch((err) => {
			return { ...err };
		});

	const defaultSector = SECTORS[0];

	const recordsSector = event.locals.pb
		?.send(`/sector/${defaultSector}`, { method: 'GET' })
		.then((r) => r.data)
		.catch((err) => {
			return { ...err };
		});

	if (user) {
		return {
			user,
			recordsScreen: await recordsScreen,
			recordsTracking: await recordsTracking,
			recordsSector: await recordsSector
		};
	}

	return {
		user: undefined,
		recordsScreen: undefined,
		recordsTracking: undefined,
		recordsSector: undefined
	};
};
