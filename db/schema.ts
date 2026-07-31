import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email"),
  requesterInitials: text("requester_initials").notNull(),
  assigneeName: text("assignee_name").notNull(),
  assigneeInitials: text("assignee_initials").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  description: text("description").notNull(),
  due: text("due").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const activity = sqliteTable("activity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: text("request_id").notNull(),
  author: text("author").notNull(),
  action: text("action").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  role: text("role").notNull(),
  area: text("area").notNull(),
  color: text("color").notNull(),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const automationRules = sqliteTable("automation_rules", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  trigger: text("trigger").notNull(),
  action: text("action").notNull(),
  owner: text("owner").notNull(),
  ownerInitials: text("owner_initials").notNull(),
  ownerColor: text("owner_color").notNull(),
  status: text("status").notNull(),
  category: text("category").notNull(),
  runsThisWeek: integer("runs_this_week").notNull(),
  lastRun: text("last_run").notNull(),
  impact: text("impact").notNull(),
});
