import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

import type { ClientResponseError } from '$lib/server/pb';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	login: async (event) => {
		const data = await event.request.formData();
		const username = data.get('username');
		const password = data.get('password');

		if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
			return fail(400, { invalid: true });
		}

		try {
			await event.locals.pb?.collection('users').authWithPassword(username, password);
		} catch (err: unknown) {
			return fail(400, { credentials: true, message: (err as ClientResponseError).data.message });
		}

		redirect(302, '/dashboard');
	}
};
