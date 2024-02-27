import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user;

	//TODO: better handle err at frontend
	const recordsScreen = event.locals.pb
		?.send('/screen', { method: 'GET' })
		.then((r) => r.screens)
		.catch((err) => {
			return { ...err };
		});

	if (user) {
		return {
			user,
			recordsScreen
		};
	}

	return {
		user: undefined,
		records: undefined
	};
};
