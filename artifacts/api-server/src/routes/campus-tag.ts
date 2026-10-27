import { randomUUID } from "node:crypto";
import { and, count, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateItemBody,
  CreateItemResponse,
  GetDashboardResponse,
  GetItemParams,
  GetItemResponse,
  GetPublicItemParams,
  GetPublicItemResponse,
  ListItemMessagesParams,
  ListItemMessagesResponse,
  ListItemsResponse,
  ListNotificationsResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
  SubmitFinderReportBody,
  SubmitFinderReportParams,
  SubmitFinderReportResponse,
  UpdateItemBody,
  UpdateItemParams,
  UpdateItemResponse,
  UpdateItemLocationBody,
  UpdateItemLocationParams,
  UpdateItemLocationResponse,
} from "@workspace/api-zod";
import {
  campusItemMessagesTable,
  campusItemsTable,
  campusNotificationsTable,
  db,
} from "@workspace/db";
import { getOwnerId, requireOwner } from "../middlewares/requireOwner";

const router: IRouter = Router();
const itemStatuses = ["active", "lost", "recovered"] as const;

function toItem(item: typeof campusItemsTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    status: item.status,
    lostMode: item.lostMode,
    publicId: item.publicId,
    photoPath: item.photoPath,
    locationLabel: item.locationLabel,
    latitude: item.latitude,
    longitude: item.longitude,
    locationReportedAt: item.locationReportedAt,
    locationSource: item.locationSource,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

router.get("/find/:publicId", async (req, res): Promise<void> => {
  const params = GetPublicItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid item tag" });
    return;
  }

  const [item] = await db
    .select({
      name: campusItemsTable.name,
      description: campusItemsTable.description,
      category: campusItemsTable.category,
      status: campusItemsTable.status,
      photoPath: campusItemsTable.photoPath,
    })
    .from(campusItemsTable)
    .where(eq(campusItemsTable.publicId, params.data.publicId))
    .limit(1);

  if (!item) {
    res.status(404).json({ error: "This Campus Tag was not found." });
    return;
  }

  res.json(GetPublicItemResponse.parse(item));
});

router.post("/find/:publicId/reports", async (req, res): Promise<void> => {
  const params = SubmitFinderReportParams.safeParse(req.params);
  const parsed = SubmitFinderReportBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Check the message and try again." });
    return;
  }

  const messageBody = parsed.data.message.trim();
  if (!messageBody) {
    res.status(400).json({ error: "Please enter a message for the owner." });
    return;
  }

  const [item] = await db
    .select()
    .from(campusItemsTable)
    .where(eq(campusItemsTable.publicId, params.data.publicId))
    .limit(1);

  if (!item) {
    res.status(404).json({ error: "This Campus Tag was not found." });
    return;
  }

  if (item.status === "recovered") {
    res.status(409).json({ error: "This item has already been recovered." });
    return;
  }

  const shareLocation = parsed.data.shareLocation === true;
  const hasLatitude = parsed.data.latitude != null;
  const hasLongitude = parsed.data.longitude != null;
  if (shareLocation && hasLatitude !== hasLongitude) {
    res.status(400).json({ error: "Location coordinates are incomplete." });
    return;
  }

  const now = new Date();
  const finderName = parsed.data.finderName?.trim();
  await db.transaction(async (tx) => {
    await tx.insert(campusItemMessagesTable).values({
      id: randomUUID(),
      itemId: item.id,
      senderType: "finder",
      senderName: finderName || null,
      body: messageBody,
      createdAt: now,
    });

    await tx.insert(campusNotificationsTable).values({
      id: randomUUID(),
      ownerId: item.ownerId,
      itemId: item.id,
      itemName: item.name,
      message: `A finder sent a message about ${item.name}.`,
      isRead: false,
      createdAt: now,
    });

    if (shareLocation && hasLatitude && hasLongitude) {
      await tx
        .update(campusItemsTable)
        .set({
          locationLabel:
            parsed.data.locationLabel?.trim() || "Finder shared a location",
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          locationReportedAt: now,
          locationSource: "finder",
          updatedAt: now,
        })
        .where(eq(campusItemsTable.id, item.id));
    }
  });

  res.status(201).json(
    SubmitFinderReportResponse.parse({
      success: true,
      itemRecovered: false,
    }),
  );
});

router.use(requireOwner);

router.get("/dashboard", async (_req, res): Promise<void> => {
  const ownerId = getOwnerId(res);
  const [groups, [unread], reports] = await Promise.all([
    db
      .select({ status: campusItemsTable.status, total: count() })
      .from(campusItemsTable)
      .where(eq(campusItemsTable.ownerId, ownerId))
      .groupBy(campusItemsTable.status),
    db
      .select({ total: count() })
      .from(campusNotificationsTable)
      .where(
        and(
          eq(campusNotificationsTable.ownerId, ownerId),
          eq(campusNotificationsTable.isRead, false),
        ),
      ),
    db
      .select({
        id: campusItemMessagesTable.id,
        itemId: campusItemMessagesTable.itemId,
        senderType: campusItemMessagesTable.senderType,
        senderName: campusItemMessagesTable.senderName,
        body: campusItemMessagesTable.body,
        createdAt: campusItemMessagesTable.createdAt,
      })
      .from(campusItemMessagesTable)
      .innerJoin(
        campusItemsTable,
        eq(campusItemsTable.id, campusItemMessagesTable.itemId),
      )
      .where(
        and(
          eq(campusItemsTable.ownerId, ownerId),
          eq(campusItemMessagesTable.senderType, "finder"),
        ),
      )
      .orderBy(desc(campusItemMessagesTable.createdAt))
      .limit(5),
  ]);

  const totalItems = groups.reduce((sum, row) => sum + row.total, 0);
  const byStatus = new Map(groups.map((row) => [row.status, row.total]));
  res.json(
    GetDashboardResponse.parse({
      totalItems,
      activeItems: byStatus.get("active") ?? 0,
      lostItems: byStatus.get("lost") ?? 0,
      recoveredItems: byStatus.get("recovered") ?? 0,
      unreadNotifications: unread?.total ?? 0,
      recentReports: reports,
    }),
  );
});

router.get("/items", async (_req, res): Promise<void> => {
  const ownerId = getOwnerId(res);
  const items = await db
    .select()
    .from(campusItemsTable)
    .where(eq(campusItemsTable.ownerId, ownerId))
    .orderBy(desc(campusItemsTable.updatedAt));

  res.json(ListItemsResponse.parse(items.map(toItem)));
});

router.post("/items", async (req, res): Promise<void> => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Check the item details and try again." });
    return;
  }

  const name = parsed.data.name.trim();
  if (!name) {
    res.status(400).json({ error: "Item name is required." });
    return;
  }
  const now = new Date();
  const [item] = await db
    .insert(campusItemsTable)
    .values({
      id: randomUUID(),
      ownerId: getOwnerId(res),
      name,
      description: parsed.data.description.trim(),
      category: parsed.data.category,
      status: "active",
      lostMode: false,
      publicId: randomUUID(),
      photoPath: parsed.data.photoPath ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.status(201).json(CreateItemResponse.parse(toItem(item)));
});

router.get("/items/:id", async (req, res): Promise<void> => {
  const params = GetItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid item ID." });
    return;
  }
  const [item] = await db
    .select()
    .from(campusItemsTable)
    .where(
      and(
        eq(campusItemsTable.id, params.data.id),
        eq(campusItemsTable.ownerId, getOwnerId(res)),
      ),
    )
    .limit(1);

  if (!item) {
    res.status(404).json({ error: "Item not found." });
    return;
  }
  res.json(GetItemResponse.parse(toItem(item)));
});

router.patch("/items/:id", async (req, res): Promise<void> => {
  const params = UpdateItemParams.safeParse(req.params);
  const parsed = UpdateItemBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Check the item update and try again." });
    return;
  }
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "Choose an item status to update." });
    return;
  }

  const ownerId = getOwnerId(res);
  const [existing] = await db
    .select()
    .from(campusItemsTable)
    .where(
      and(
        eq(campusItemsTable.id, params.data.id),
        eq(campusItemsTable.ownerId, ownerId),
      ),
    )
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Item not found." });
    return;
  }

  const status = parsed.data.status ??
    (parsed.data.lostMode === undefined
      ? existing.status
      : parsed.data.lostMode
        ? "lost"
        : existing.status === "recovered"
          ? "recovered"
          : "active");
  const nextStatus = itemStatuses.includes(status) ? status : existing.status;
  const lostMode =
    nextStatus === "recovered"
      ? false
      : parsed.data.status === "active"
        ? false
        : parsed.data.status === "lost"
          ? true
          : parsed.data.lostMode ?? existing.lostMode;

  const [updated] = await db
    .update(campusItemsTable)
    .set({ status: nextStatus, lostMode, updatedAt: new Date() })
    .where(
      and(
        eq(campusItemsTable.id, params.data.id),
        eq(campusItemsTable.ownerId, ownerId),
      ),
    )
    .returning();
  res.json(UpdateItemResponse.parse(toItem(updated)));
});

router.get("/items/:id/messages", async (req, res): Promise<void> => {
  const params = ListItemMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid item ID." });
    return;
  }
  const ownerId = getOwnerId(res);
  const [item] = await db
    .select({ id: campusItemsTable.id })
    .from(campusItemsTable)
    .where(
      and(
        eq(campusItemsTable.id, params.data.id),
        eq(campusItemsTable.ownerId, ownerId),
      ),
    )
    .limit(1);
  if (!item) {
    res.status(404).json({ error: "Item not found." });
    return;
  }

  const messages = await db
    .select()
    .from(campusItemMessagesTable)
    .where(eq(campusItemMessagesTable.itemId, item.id))
    .orderBy(desc(campusItemMessagesTable.createdAt));
  res.json(ListItemMessagesResponse.parse(messages));
});

router.post("/items/:id/location", async (req, res): Promise<void> => {
  const params = UpdateItemLocationParams.safeParse(req.params);
  const parsed = UpdateItemLocationBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Enter a location and try again." });
    return;
  }
  const latitudePresent = parsed.data.latitude != null;
  const longitudePresent = parsed.data.longitude != null;
  if (latitudePresent !== longitudePresent) {
    res.status(400).json({ error: "Enter both map coordinates or neither." });
    return;
  }

  const ownerId = getOwnerId(res);
  const now = new Date();
  const [item] = await db
    .update(campusItemsTable)
    .set({
      locationLabel: parsed.data.locationLabel.trim(),
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      locationReportedAt: now,
      locationSource: "owner",
      updatedAt: now,
    })
    .where(
      and(
        eq(campusItemsTable.id, params.data.id),
        eq(campusItemsTable.ownerId, ownerId),
      ),
    )
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found." });
    return;
  }
  res.json(UpdateItemLocationResponse.parse(toItem(item)));
});

router.get("/notifications", async (_req, res): Promise<void> => {
  const ownerId = getOwnerId(res);
  const notifications = await db
    .select()
    .from(campusNotificationsTable)
    .where(eq(campusNotificationsTable.ownerId, ownerId))
    .orderBy(desc(campusNotificationsTable.createdAt));
  res.json(ListNotificationsResponse.parse(notifications));
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid notification." });
    return;
  }
  const ownerId = getOwnerId(res);
  const [notification] = await db
    .update(campusNotificationsTable)
    .set({ isRead: true })
    .where(
      and(
        eq(campusNotificationsTable.id, params.data.id),
        eq(campusNotificationsTable.ownerId, ownerId),
      ),
    )
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found." });
    return;
  }
  res.json(MarkNotificationReadResponse.parse(notification));
});

export default router;
