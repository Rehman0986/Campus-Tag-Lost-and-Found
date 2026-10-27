import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import {
  boolean,
  doublePrecision,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const campusItemCategory = pgEnum("campus_item_category", [
  "Bottle",
  "Bag",
  "Keys",
  "Wallet",
  "Electronics",
  "Other",
]);

export const campusItemStatus = pgEnum("campus_item_status", [
  "active",
  "lost",
  "recovered",
]);

export const campusLocationSource = pgEnum("campus_location_source", [
  "owner",
  "finder",
]);

export const campusMessageSender = pgEnum("campus_message_sender", [
  "owner",
  "finder",
]);

export const campusItemsTable = pgTable(
  "campus_items",
  {
    id: uuid("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    category: campusItemCategory("category").notNull(),
    status: campusItemStatus("status").notNull().default("active"),
    lostMode: boolean("lost_mode").notNull().default(false),
    publicId: text("public_id").notNull(),
    photoPath: text("photo_path"),
    locationLabel: text("location_label"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    locationReportedAt: timestamp("location_reported_at", {
      withTimezone: true,
    }),
    locationSource: campusLocationSource("location_source"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("campus_items_owner_idx").on(table.ownerId),
    uniqueIndex("campus_items_public_id_idx").on(table.publicId),
  ],
);

export const campusItemMessagesTable = pgTable(
  "campus_item_messages",
  {
    id: uuid("id").primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => campusItemsTable.id, { onDelete: "cascade" }),
    senderType: campusMessageSender("sender_type").notNull(),
    senderName: text("sender_name"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("campus_item_messages_item_idx").on(table.itemId)],
);

export const campusNotificationsTable = pgTable(
  "campus_notifications",
  {
    id: uuid("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => campusItemsTable.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("campus_notifications_owner_created_idx").on(
      table.ownerId,
      table.createdAt,
    ),
  ],
);

export const insertCampusItemSchema = createInsertSchema(campusItemsTable).omit(
  {
    createdAt: true,
    updatedAt: true,
  },
);
export const insertCampusItemMessageSchema = createInsertSchema(
  campusItemMessagesTable,
).omit({ createdAt: true });
export const insertCampusNotificationSchema = createInsertSchema(
  campusNotificationsTable,
).omit({ createdAt: true });

export type InsertCampusItem = z.infer<typeof insertCampusItemSchema>;
export type CampusItem = typeof campusItemsTable.$inferSelect;
export type CampusItemMessage = typeof campusItemMessagesTable.$inferSelect;
export type CampusNotification = typeof campusNotificationsTable.$inferSelect;
