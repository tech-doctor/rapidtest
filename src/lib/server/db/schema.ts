import { pgTable,
	timestamp,
	integer,
	uuid,
	text } from 'drizzle-orm/pg-core';

// export const user = pgTable('user', {
// 	id: serial('id').primaryKey(),
// 	age: integer('age'),
// });

export const teeTimes = pgTable('tee_times', {
	id: uuid('id').defaultRandom().primaryKey(),
	time: timestamp('time', { mode: 'date' }).notNull().unique(),
	price: text('price').notNull(),
	minPlayers: integer('min_players').notNull(),
	maxPlayers: integer('max_players').notNull(),
	holes: text('holes').notNull()
});
