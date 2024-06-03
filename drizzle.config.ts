import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/drizzle.ts',
	out: './drizzle',
	dbCredentials: {
		url: 'sqlite.db'
	}
});
