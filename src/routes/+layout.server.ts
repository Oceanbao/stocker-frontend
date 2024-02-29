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
		?.send('/tracking/all', { method: 'GET' })
		.then((r) => r.data)
		.catch((err) => {
			return { ...err };
		});

	if (user) {
		return {
			user,
			recordsScreen,
			recordsTracking: await recordsTracking
		};
	}

	return {
		user: undefined,
		recordsScreen: undefined,
		recordsTracking: undefined
	};
};
