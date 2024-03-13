import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const url = '/dele/updatescreen';
	const response = await event.locals.pb?.send(url, {
		method: 'GET'
	});

	return json({
		message: 'ok',
		data: response
	});
};

// export const POST: RequestHandler = async (event) => {
// 	const tickers = event.url.searchParams.get('tickers');
// 	const tickersPayload = tickers?.split(',');

// 	const url = '/dele/deletestocks';
// 	const response = await event.locals.pb?.send(url, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({
// 			tickers: tickersPayload
// 		})
// 	});

// 	return json({
// 		message: 'ok',
// 		data: response
// 	});
// };
