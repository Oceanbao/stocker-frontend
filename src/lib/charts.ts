export type TRsi = ReturnType<typeof computeRSI>[0];

export function computeRSI(data: { time: string; closing: number }[], period: number) {
	const closing = data.map((x) => x.closing);
	const pastAvgPeriod = period - 1;
	const rsi: number[] = [];
	const gains: number[] = [];
	const losses: number[] = [];
	let rsGain = 0;
	let rsLoss = 0;

	for (let idx = 0; idx <= closing.length; idx++) {
		if (idx === 0) {
			gains.push(0);
			losses.push(0);
			rsGain = 0;
			rsLoss = 0;
			continue;
		}
		const diff = closing[idx] - closing[idx - 1];
		if (diff > 0) {
			gains[idx] = diff;
			losses[idx] = 0;
		} else {
			gains[idx] = 0;
			losses[idx] = -diff;
		}
		rsGain = (rsGain * pastAvgPeriod + gains[idx]) / period;
		rsLoss = (rsLoss * pastAvgPeriod + losses[idx]) / period;
		if (rsGain === 0 || rsLoss === 0) {
			rsi[idx] = 0;
			continue;
		}
		const rs = rsGain / rsLoss;
		rsi[idx] = (rs / (1 + rs)) * 100;
	}

	const result = data.map((x, idx) => ({
		time: x.time,
		value: rsi[idx]
	}));

	return result;
}

const DemoKDJ = {
	time: '2020-01-01',
	k: 50,
	d: 50,
	j: 50
};

export type TKdj = typeof DemoKDJ;

const DemoDaily = {
	close: 4.8,
	high: 4.82,
	low: 4.7,
	open: 4.8,
	time: '2023-05-30'
};

export type TDaily = typeof DemoDaily;

export function computeKDJ(data: TDaily[]) {
	const allRSV: number[] = [];
	const rsv = (idx: number) => {
		const range = () => {
			const diff = idx + 1 - 9;
			const start = diff > 0 ? diff : 0;
			return data.slice(start, idx + 1);
		};

		const C = data[idx].close;
		const L = range().reduce((acc, curr) => (acc < curr.low ? acc : curr.low), 9999);
		const H = range().reduce((acc, curr) => (acc > curr.high ? acc : curr.high), -1);

		return ((C - L) / (H - L)) * 100;
	};

	data.forEach((_, idx) => allRSV.push(rsv(idx)));

	const result: TKdj[] = [];

	allRSV.forEach((thisRSV, idx) => {
		if (idx === 0) {
			result.push({
				time: data[idx].time,
				k: 50,
				d: 50,
				j: 50
			});
			return;
		}

		const thisK = (2 * result[idx - 1].k + thisRSV) / 3;
		const thisD = (2 * result[idx - 1].d + thisK) / 3;
		const thisJ = 3 * thisK - 2 * thisD;

		result.push({
			time: data[idx].time,
			k: thisK,
			d: thisD,
			j: thisJ
		});
	});

	return result;
}

export type TMacd = {
	time: string;
	ema12: number;
	ema26: number;
	hist: number;
	diff: number;
	dea: number;
};

export function computeMACD(data: TDaily[]): TMacd[] {
	const time: string[] = [];
	const ema12: number[] = [];
	const ema26: number[] = [];
	const diff: number[] = [];
	const dea: number[] = [];
	const hist: number[] = [];

	for (const [idx, val] of data.entries()) {
		time.push(val.time);
		if (idx === 0) {
			const thisEma12 = (val.close * 11 + val.close * 2) / 13;
			const thisEma26 = (val.close * 25 + val.close * 2) / 27;
			ema12.push(thisEma12);
			ema26.push(thisEma26);
			const thisDiff = thisEma12 - thisEma26;
			const thisDea = (thisDiff * 8 + thisDiff * 2) / 10;
			diff.push(thisDiff);
			dea.push(thisDea);
			hist.push(2 * (thisDiff - thisDea));
			continue;
		}

		const thisEma12 = (ema12[idx - 1] * 11 + val.close * 2) / 13;
		const thisEma26 = (ema26[idx - 1] * 25 + val.close * 2) / 27;
		ema12.push(thisEma12);
		ema26.push(thisEma26);
		const thisDiff = thisEma12 - thisEma26;
		const thisDea = (dea[idx - 1] * 8 + thisDiff * 2) / 10;
		diff.push(thisDiff);
		dea.push(thisDea);
		hist.push(2 * (thisDiff - thisDea));
	}

	const output: TMacd[] = [];

	for (const idx of data.keys()) {
		output.push({
			time: time[idx],
			ema12: ema12[idx],
			ema26: ema26[idx],
			hist: hist[idx],
			diff: diff[idx],
			dea: dea[idx]
		});
	}

	return output;
}

function sum(x: number[]): number {
	return x.reduce((prev, curr) => (prev += curr));
}

export type TEma = {
	time: string;
	value: number;
};

export function computeEMA(data: TDaily[], period: number): TEma[] {
	const ema: number[] = [];
	const closing = data.map((x) => x.close);

	for (let i = 0; i < data.length; i++) {
		if (i < period) {
			ema.push(sum(closing.slice(0, i + 1)) / (i + 1));
		} else {
			ema.push(closing[i] * (2 / (period + 1)) + ema[i - 1] * ((period - 1) / (period + 1)));
		}
	}
	return data.map((x, i) => ({
		time: x.time,
		value: ema[i]
	}));
}

export type TSma = {
	time: string;
	value: number;
};

export function computeSMA(data: TDaily[], period: number): TSma[] {
	const sma: number[] = [];
	const closing = data.map((x) => x.close);

	const initSma = sum(closing.slice(0, period)) / period;

	for (let i = 0; i < period; i++) {
		sma.push(initSma);
	}

	for (let i = period; i < data.length; i++) {
		const lastSMA = sma[sma.length - 1];
		const thisSMA = lastSMA + (closing[i] - closing[i - period]) / period;
		sma.push(thisSMA);
	}

	return data.map((x, i) => ({
		time: x.time,
		value: sma[i]
	}));
}

// 	for _, idx := range lo.RangeFrom(int(n), len(closes)-int(n)) {
// 		lastSMA, err := lo.Last(sma)
// 		if err != nil {
// 			return nil, err
// 		}
// 		thisSMA := lastSMA + (closes[idx]-closes[idx-int(n)])/n
// 		sma = append(sma, thisSMA)
// 	}

// 	return sma, nil
// }
