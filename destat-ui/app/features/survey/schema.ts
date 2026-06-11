//static
//-title, description, img, view, participantNum, question...

//dynamic
// -answer, view ..

import {
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
  boolean,
  serial,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";

export const survey = pgTable("survey", {
  id: varchar().notNull().primaryKey(),
  title: varchar().notNull(),
  description: varchar().notNull(),
  target_number: integer().notNull(),
  reward_amount: doublePrecision().notNull(),
  question: jsonb().notNull(),
  owner: varchar().notNull(),
  image: text().notNull(),
  view: integer().notNull().default(0),
  finished: boolean().default(false),
  created_at: timestamp().notNull().defaultNow(),
});

export const answer = pgTable("answer", {
  id: serial().primaryKey(),
  answer: jsonb().default({}),
  survey_id: varchar()
    .references(() => survey.id)
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
});
