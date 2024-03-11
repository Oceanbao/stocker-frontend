import { type Handle, type HandleServerError, redirect } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { createPB } from '$lib/server/pb';

const PROTECTED_ROUTES: string[] = ['/dashboard'];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = createPB();

	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = structuredClone(event.locals.pb.authStore.model);
		}
	} catch (_) {
		event.locals.pb.authStore.clear();
	}

	if (PROTECTED_ROUTES.includes(event.url.pathname)) {
		if (!event.locals.user) {
			throw redirect(302, '/login');
		}
	}

	const response = await resolve(event);

	response.headers.append(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({
			secure: !dev,
			sameSite: 'Lax',
			httpOnly: false,
			maxAge: 60 * 60,
			path: '/'
		})
	);

	return response;
};

export const handleError = (({ error, event }) => {
	return {
		message: `Server Error: ${error} (cookies: ${JSON.stringify(event.cookies)})`
	};
}) satisfies HandleServerError;
