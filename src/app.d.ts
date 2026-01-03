// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, User } from "better-auth/types";

interface ExtendedUser extends User {
	premium: boolean;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | undefined;
			user: ExtendedUser | undefined;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
