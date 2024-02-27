// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
		}
		type PocketBase = import('pocketbase').default;
		type PocketBaseUserModel = import('pocketbase').default['authStore']['model'];
		interface Locals {
			pb?: PocketBase;
			user?: PocketBaseUserModel;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
