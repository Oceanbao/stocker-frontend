import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const records = await event.locals.pb?.collection('screen').getFullList();

	return new Response(
		JSON.stringify({
			data: records
		})
	);
};

// export const POST: RequestHandler = async (event) => {
// 	const { start } = await event.request.json();
// 	if (!start) {
// 		return new Response(
// 			JSON.stringify({
// 				result: 'require start query.'
// 			})
// 		);
// 	}

// 	const data = getData(parseInt(start));

// 	const promises = data.map((x) => {
// 		return event.locals.pb?.collection('stocks').create(x, {
// 			$autoCancel: false
// 		});
// 	});

// 	const results = await Promise.allSettled(promises);

// 	const failed = results.filter((x) => x.status === 'rejected');

// 	return new Response(
// 		JSON.stringify({
// 			result: failed.length ? failed : 'ok'
// 		})
// 	);
// };
