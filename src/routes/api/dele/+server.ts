import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const url = '/dele/updatestocks';
	const response = await event.locals.pb?.send(url, {
		method: 'GET'
	});

	return json({
		message: 'ok',
		data: response
	});
};
