import { defineConfig } from 'drizzle-kit';
export default defineConfig({schema:'./proof/auth/schema.ts',out:'./proof/auth/migrations',dialect:'sqlite'});
