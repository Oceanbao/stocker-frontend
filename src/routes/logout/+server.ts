import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
	event.locals.pb?.authStore.clear();

	event.locals.user = undefined;

	throw redirect(302, '/');
};
