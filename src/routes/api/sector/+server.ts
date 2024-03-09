import { SECTORS } from '$lib/server/sectors';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const sector = event.url.searchParams.get('sector');
	if (!sector) {
		return json({
			message: 'error',
			error: 'requires param'
		});
	}
	if (!SECTORS.includes(sector)) {
		return json({
			message: 'error',
			error: 'sector not supported'
		});
	}

	const response = await event.locals.pb?.send(`/sector/${sector}`, {
		method: 'GET'
	});

	return json({
		message: 'ok',
		data: response
	});
};
