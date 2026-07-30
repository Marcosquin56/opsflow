import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { activity, requests } from "../../../db/schema";
import { formatRelativeTime } from "../../../lib/relative-time";
import { getCurrentUser, unauthorized } from "../../../lib/auth";
import { sendStatusEmail } from "../../../email/send";

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

async function loadRequests() {
  const db = getDb();
  const [requestRows, activityRows] = await Promise.all([
    db.select().from(requests).orderBy(desc(requests.updatedAt)),
    db.select().from(activity).orderBy(desc(activity.createdAt)),
  ]);

  return requestRows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    requester: row.requesterName,
    requesterEmail: row.requesterEmail ?? undefined,
    requesterInitials: row.requesterInitials,
    assignee: row.assigneeName,
    assigneeInitials: row.assigneeInitials,
    status: row.status,
    priority: row.priority,
    created: formatRelativeTime(row.createdAt),
    updated: formatRelativeTime(row.updatedAt),
    due: row.due,
    description: row.description,
    activity: activityRows
      .filter((item) => item.requestId === row.id)
      .map((item) => ({
        author: item.author,
        action: item.action,
        time: formatRelativeTime(item.createdAt),
      })),
  }));
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    return Response.json({ requests: await loadRequests() });
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const payload = (await request.json()) as {
      title?: string;
      category?: string;
      priority?: string;
      description?: string;
      requesterName?: string;
      requesterInitials?: string;
      requesterEmail?: string;
    };

    const title = payload.title?.trim() ?? "";
    const description = payload.description?.trim() ?? "";
    const requesterName = payload.requesterName?.trim() ?? "";
    const requesterInitials = payload.requesterInitials?.trim() ?? "";

    if (!title || !description || !requesterName) {
      return Response.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.select({ id: requests.id }).from(requests);
    const nextNumber =
      existing.reduce((max, row) => {
        const num = Number(row.id.split("-")[1]);
        return Number.isFinite(num) ? Math.max(max, num) : max;
      }, 1800) + 1;
    const id = `OPS-${nextNumber}`;

    await db.insert(requests).values({
      id,
      title,
      category: payload.category?.trim() || "Automatización",
      requesterName,
      requesterEmail: payload.requesterEmail?.trim() || null,
      requesterInitials: requesterInitials || requesterName.slice(0, 2).toUpperCase(),
      assigneeName: "Sin asignar",
      assigneeInitials: "—",
      status: "Nuevo",
      priority: payload.priority?.trim() || "Media",
      description,
      due: "Por definir",
    });

    await db.insert(activity).values({
      requestId: id,
      author: user.name,
      action: "creó la solicitud",
    });

    const requesterEmail = payload.requesterEmail?.trim() || null;
    await sendStatusEmail({
      to: requesterEmail,
      requesterName,
      requestId: id,
      requestTitle: title,
      status: "Nuevo",
    });

    const created = (await loadRequests()).find((item) => item.id === id);
    return Response.json({ request: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}
