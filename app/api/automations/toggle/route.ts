import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { automationRules } from "../../../../db/schema";
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

    const payload = (await request.json()) as { id?: string };
    const id = payload.id?.trim() ?? "";
    if (!id) {
      return Response.json({ error: "Falta el id" }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.id, id));
    if (!existing) {
      return Response.json({ error: "Regla no encontrada" }, { status: 404 });
    }

    const nextStatus = existing.status === "active" ? "paused" : "active";
    await db
      .update(automationRules)
      .set({ status: nextStatus })
      .where(eq(automationRules.id, id));

    return Response.json({ automation: { ...existing, status: nextStatus } });
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}
