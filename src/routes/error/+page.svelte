<script lang="ts">
	import { page } from '$app/stores';
</script>

<main>
	<h1>Whoops!</h1>
	<p>{($page.error, $page.status)}</p>
</main>
