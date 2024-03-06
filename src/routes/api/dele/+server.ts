import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const ticker = event.url.searchParams.get('ticker');
	if (!ticker) {
		return json({
			message: 'error',
			error: 'required param missing'
		});
	}

	const response = await event.locals.pb?.send(`/dele/updatestock?ticker=${ticker}`, {
		method: 'GET'
	});

	return json({
		message: 'ok',
		data: response
	});
};
