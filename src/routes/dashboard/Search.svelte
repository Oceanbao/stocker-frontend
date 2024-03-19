<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { Input } from '$lib/components/ui/input';
	import type { TServerStock } from '$lib/server/types';

	import ModalChartSearch from './ModalChartSearch.svelte';
	import ModalSearch from './ModalSearch.svelte';

	let inputValue = '';
	let openModalChart = false;
	let openModalSearch = false;
	let openModalSearchChartTicker = '';
	let serverStock: TServerStock;

	$: if (openModalSearchChartTicker) {
		console.log('open');
		inputValue = openModalSearchChartTicker;
		submitHandler();
	}

	async function submitHandler() {
		const loadingToast = toast.loading('Searching...');

		const ticker = inputValue;

		const baseUrl = '/api/stock';

		try {
			const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
				method: 'GET'
			});
			toast.dismiss(loadingToast);

			const { data } = await resp.json();
			if (data.message === 'error') {
				toast.error(data.error);
				openModalSearch = true;
				return;
			}
			toast.success('Found.');
			serverStock = data.data;
			openModalChart = true;
		} catch (err) {
			toast.error(`error: ${err}`);
		}

		inputValue = '';
	}
</script>

<ModalChartSearch bind:openModalChart {serverStock} />
<ModalSearch bind:openModalSearch bind:openModalSearchChartTicker />

<form on:submit={submitHandler} class="flex w-full max-w-sm items-center space-x-2">
	<Input
		type="search"
		placeholder="Search..."
		bind:value={inputValue}
		on:focus={() => (inputValue = '')}
		required
	/>
</form>
