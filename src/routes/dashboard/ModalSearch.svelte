<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	export let openModalSearch: boolean;
	export let openModalSearchChartTicker = '';

	let inputValue = '';
	let foundTicker = '';
	let foundName = '';
	let disableAdd = false;
	let tickerCreated = '';

	async function submitHandler(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;

		const loadingToast = toast.loading('Searching...');
		const ticker = inputValue;
		const baseUrl = '/api/stock/verify';

		try {
			const resp = await fetch(`${baseUrl}?ticker=${ticker}`, {
				method: 'GET'
			});
			const body = await resp.json();

			toast.dismiss(loadingToast);

			// TODO: shape of API,
			// body.data - app level data
			// body.error - app level API error
			// body.data.data - server level data
			// body.data.error - server level error
			if (body.data.message === 'error') {
				toast.error(`${body.data.error}`);
				return;
			}
			toast.success('Found');
			foundTicker = `${body.data.data.data.f107}.${body.data.data.data.f57}`;
			foundName = body.data.data.data.f58;
		} catch (err) {
			toast.error(`error: ${err}`);
		}

		inputValue = '';
	}

	async function createTickerHandler() {
		const loadingToast = toast.loading('Creating ticker...');
		const ticker = foundTicker;
		const baseUrl = `/api/stock?ticker=${ticker}`;

		try {
			const resp = await fetch(baseUrl, {
				method: 'POST'
			});
			const body = await resp.json();

			toast.dismiss(loadingToast);

			if (body.data.message === 'error') {
				toast.error(`${body.data.error}`);
				return;
			}
			toast.success('Created.');
			disableAdd = true;
			tickerCreated = ticker;
		} catch (err) {
			toast.error(`error: ${err}`);
		}

		inputValue = '';
	}

	$: console.log(openModalSearch, foundTicker, tickerCreated);

	async function clearModal() {
		openModalSearch = false;
		foundTicker = '';
		foundName = '';
		tickerCreated = '';
		disableAdd = false;
	}

	function openTickerModalHandler() {
		openModalSearchChartTicker = tickerCreated;
		// FIXME
		clearModal();
	}
</script>

<Dialog.Root open={openModalSearch} onOpenChange={clearModal}>
	<Dialog.Content class="sm:max-w-[425px] [&_button[type='button']]:hidden">
		<Dialog.Header>
			<Dialog.Title>Ticker Search</Dialog.Title>
			<Dialog.Description>Search and crawl new ticker.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Ticker</Label>
				<Input
					id="name"
					bind:value={inputValue}
					placeholder="enter sticker here"
					class="col-span-3"
					on:keyup={(e) => submitHandler(e)}
				/>
			</div>
			{#if foundTicker}
				<Badge class="m-auto flex gap-2">
					<p>
						{foundTicker}
						{foundName}
					</p>
					{#if tickerCreated}
						<Button type="submit" variant="secondary" on:click={openTickerModalHandler}>Open</Button
						>
					{:else}
						<Button
							type="submit"
							variant="secondary"
							on:click={createTickerHandler}
							disabled={disableAdd}>Add</Button
						>
					{/if}
				</Badge>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
