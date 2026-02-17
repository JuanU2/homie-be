import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  primaryKey,
  uniqueIndex,
  date,
  customType,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

const geographyPoint = customType<{
  data: string; // budeme posielať WKT alebo ST_Point SQL
}>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

export const interestEnum = pgEnum("interest_enum", [
  "FIND_HOUSING",
  "RENT",
]);

export const roomTypeEnum = pgEnum("room_type_enum", [
  "DORMITORY",
  "BATHROOM",
  "KITCHEN",
  "LIVING_ROOM",
  "TOILET",
  "WARDROBE",
]);

export const currencyEnum = pgEnum("currency_enum", [
  "EUR",
  "CZK",
  "USD",
]);

export const roommateRequestStatusEnum = pgEnum("roommate_request_status_enum", [
  "ACTIVE",
  "RESERVED",
  "CLOSED",
  "EXPIRED",
]);

export const roommateApplicationStatusEnum = pgEnum(
  "roommate_application_status_enum",
  ["PENDING", "ACCEPTED", "REJECTED"]
);

/* =========================
   USER
========================= */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),

    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),

    primaryInterest: interestEnum("primary_interest").notNull(),

    idealLocation: geographyPoint("ideal_location"),

    phone: varchar("phone", { length: 50 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  })
);

/* =========================
   PROPERTY
========================= */

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),

  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  description: text("description").notNull(),

  sizeM2: integer("size_m2"),

  roomCount: integer("room_count").notNull(),

  country: varchar("country", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  zipCode: varchar("zip_code", { length: 50 }).notNull(),

  street: varchar("street", { length: 255 }),
  streetNumber: varchar("street_number", { length: 50 }).notNull(),

  location: geographyPoint("location").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =========================
   ROOM
========================= */

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),

  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),

  roomType: roomTypeEnum("room_type").notNull(),

  sizeM2: integer("size_m2"),
});

/* =========================
   EQUIPMENT TYPE
========================= */

export const equipmentTypes = pgTable(
  "equipment_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("equipment_types_name_unique").on(table.name),
  })
);

/* =========================
   ROOM EQUIPMENT (M:N)
========================= */

export const roomEquipment = pgTable(
  "room_equipment",
  {
    roomId: uuid("room_id")
      .references(() => rooms.id, { onDelete: "cascade" })
      .notNull(),

    equipmentTypeId: uuid("equipment_type_id")
      .references(() => equipmentTypes.id, { onDelete: "cascade" })
      .notNull(),

    quantity: integer("quantity").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.roomId, table.equipmentTypeId],
    }),
  })
);

/* =========================
   ROOMMATE REQUEST
========================= */

export const roommateRequests = pgTable("roommate_requests", {
  id: uuid("id").defaultRandom().primaryKey(),

  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),

  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  description: text("description").notNull(),

  priceAmount: integer("price_amount").notNull(),
  priceCurrency: currencyEnum("price_currency").notNull(),

  idealMoveInDate: date("ideal_move_in_date"),

  maxRoommates: integer("max_roommates").notNull(),
  currentRoommates: integer("current_roommates").notNull(),

  status: roommateRequestStatusEnum("status")
    .default("ACTIVE")
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  closedAt: timestamp("closed_at", { withTimezone: true }),
});

/* =========================
   ROOMMATE APPLICATION
========================= */

export const roommateApplications = pgTable("roommate_applications", {
  id: uuid("id").defaultRandom().primaryKey(),

  roommateRequestId: uuid("roommate_request_id")
    .references(() => roommateRequests.id, { onDelete: "cascade" })
    .notNull(),

  applicantId: uuid("applicant_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  status: roommateApplicationStatusEnum("status")
    .default("PENDING")
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =========================
   CONVERSATION
========================= */

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =========================
   CONVERSATION PARTICIPANT
========================= */

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.conversationId, table.userId],
    }),
  })
);

/* =========================
   MESSAGE
========================= */

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),

  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
