import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const ticker = event.url.searchParams.get('ticker');
	if (!ticker) {
		return new Response(
			JSON.stringify({
				status: 'error',
				message: 'require ticker'
			})
		);
	}

	// const today = new Date();
	// const xDayAgo = 240;
	// const thatDate = new Date(today - 1000 * 60 * 60 * 24 * xDayAgo);
	// const thatDateFormatted = thatDate.toJSON().slice(0, 10);

	const records = await event.locals.pb?.collection('daily').getFullList({
		filter: `ticker = "${ticker}"`
		// filter: `code = "${code}" && date >= "${thatDateFormatted} 00:00:00"`
	});

	return new Response(
		JSON.stringify({
			status: 'ok',
			data: records
		})
	);
};
