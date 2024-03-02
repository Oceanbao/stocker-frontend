<script>
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
</script>

<Toaster richColors />

<slot />

<style>
	:global(body) {
		height: 100svh;
	}
</style>
