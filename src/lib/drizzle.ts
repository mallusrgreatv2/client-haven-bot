import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { text, sqliteTable, int } from 'drizzle-orm/sqlite-core';
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);

export const tags = sqliteTable('tags', {
	id: int('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	trigger: text('trigger'),
	response: text('response').notNull()
});
