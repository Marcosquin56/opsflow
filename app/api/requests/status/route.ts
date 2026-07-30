import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { activity, requests } from "../../../../db/schema";
import { formatRelativeTime, sqliteTimestamp } from "../../../../lib/relative-time";
import { sendStatusEmail } from "../../../../email/send";
import { getCurrentUser, unauthorized } from "../../../../lib/auth";

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("no such table")) {
    return "Las tablas todavía no existen. Generá la migración con `pnpm run db:generate` y aplicala a la base D1.";
  }

  return message;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const payload = (await request.json()) as {
      id?: string;
      status?: string;
    };

    const id = payload.id?.trim() ?? "";
    const status = payload.status?.trim() ?? "";
    const actorName = user.name;

    if (!id || !status) {
      return Response.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db.select().from(requests).where(eq(requests.id, id));
    if (!existing) {
      return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    await db
      .update(requests)
      .set({ status, updatedAt: sqliteTimestamp() })
      .where(eq(requests.id, id));

    await db.insert(activity).values({
      requestId: id,
      author: actorName,
      action: `movió la solicitud a ${status}`,
    });

    await sendStatusEmail({
      to: existing.requesterEmail,
      requesterName: existing.requesterName,
      requestId: id,
      requestTitle: existing.title,
      status,
    });

    const [updated] = await db.select().from(requests).where(eq(requests.id, id));
    const activityRows = await db
      .select()
      .from(activity)
      .where(eq(activity.requestId, id));

    return Response.json({
      request: {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        requester: updated.requesterName,
        requesterEmail: updated.requesterEmail ?? undefined,
        requesterInitials: updated.requesterInitials,
        assignee: updated.assigneeName,
        assigneeInitials: updated.assigneeInitials,
        status: updated.status,
        priority: updated.priority,
        created: formatRelativeTime(updated.createdAt),
        updated: formatRelativeTime(updated.updatedAt),
        due: updated.due,
        description: updated.description,
        activity: activityRows
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
          .map((item) => ({
            author: item.author,
            action: item.action,
            time: formatRelativeTime(item.createdAt),
          })),
      },
    });
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}
