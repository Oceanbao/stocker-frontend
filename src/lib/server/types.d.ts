const demoScreen = {
	daily: {
		ticker: '1.603477',
		date: '2024-03-01 00:00:00.000Z',
		open: 33.63,
		high: 33.75,
		low: 31.7,
		close: 32.2,
		volume: 100335,
		value: 324764334,
		volatility: 6.05,
		pchange: -4.93,
		change: -1.67,
		turnover: 1.97
	},
	kdj: 19.384953053601762,
	stock: {
		ticker: '1.603477',
		name: '巨星农牧',
		etf: false,
		dateofpublic: '2017-12-18 00:00:00.000Z',
		eps: -0.672822516,
		undistprofit: 0.616833660877,
		totalshare: 509448062,
		totalshareout: 509448062,
		totcalcap: 33.9333486141059,
		tradecap: 33.9333486141059,
		netasset: 36.5146867962078,
		netassetpershare: 5.9849458,
		netprofit: -342768127.02,
		netprofitchange: -254.082891201779,
		profitmargin: -11.420945207499999,
		priceperearning: -3589,
		priceperbook: 538,
		roe: -9.81,
		totalrevenue: 3005862559.21,
		totalrevenuechange: 19.4736612536,
		grossprofitmargin: -0.4946788962,
		debtratio: 56.5867218278,
		ranktotalcap: 0,
		ranknetasset: 0,
		ranknetprofit: 0,
		rankgrossmargin: 0,
		rankper: 0,
		rankpbr: 0,
		ranknetmargin: 0,
		rankroe: 0,
		sector: '',
		sectortotal: 0
	}
};

export type TScreen = typeof demoScreen;
export type TStock = typeof demoScreen.stock;
