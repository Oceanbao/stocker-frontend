import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const records = await event.locals.pb?.collection('screen').getFullList();

	return new Response(
		JSON.stringify({
			data: records
		})
	);
};
