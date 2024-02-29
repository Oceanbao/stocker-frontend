import { json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async (event) => {
	const ticker = event.url.searchParams.get('ticker');
	if (!ticker) {
		return json({
			message: 'error',
			error: 'required param missing'
		});
	}

	const response = await event.locals.pb?.send(`/stocks/${ticker}`, {
		method: 'DELETE'
	});

	return json({
		message: 'ok',
		data: response
	});
};
