import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({ origin: url.origin });
