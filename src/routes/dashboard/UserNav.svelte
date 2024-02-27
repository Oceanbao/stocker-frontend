<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';

	export let username: string;
	export let useremail: string;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
			<Avatar.Root class="h-8 w-8">
				<Avatar.Image src="/dancing-gopher.gif" alt="@oceanbao" />
				<Avatar.Fallback>OB</Avatar.Fallback>
			</Avatar.Root>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-48">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				<p class="text-sm font-medium leading-none">{username}</p>
				<p class="text-xs leading-none text-muted-foreground">{useremail}</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<!-- <DropdownMenu.Group> -->
		<!-- 	<DropdownMenu.Item> -->
		<!-- 		Profile -->
		<!-- 		<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut> -->
		<!-- 	</DropdownMenu.Item> -->
		<!-- 	<DropdownMenu.Item> -->
		<!-- 		Billing -->
		<!-- 		<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut> -->
		<!-- 	</DropdownMenu.Item> -->
		<!-- 	<DropdownMenu.Item> -->
		<!-- 		Settings -->
		<!-- 		<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut> -->
		<!-- 	</DropdownMenu.Item> -->
		<!-- 	<DropdownMenu.Item>New Team</DropdownMenu.Item> -->
		<!-- </DropdownMenu.Group> -->
		<!-- <DropdownMenu.Separator /> -->
		<a href="/logout">
			<DropdownMenu.Item>
				Log out
				<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</a>
	</DropdownMenu.Content>
</DropdownMenu.Root>
