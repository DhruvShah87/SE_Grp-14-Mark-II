import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userID: serial("userID").primaryKey(),
  name: varchar("name", { length: 40 }).notNull(),
  password: text("password"),
  emailId: varchar("email_id", { length: 60 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isVerified: boolean("is_verified").notNull().default(false),
});
