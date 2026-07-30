import { getDb } from "../../../db";
import { automationRules } from "../../../db/schema";
import { getCurrentUser, unauthorized } from "../../../lib/auth";

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

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const db = getDb();
    const rows = await db.select().from(automationRules);
    return Response.json({ automations: rows });
  } catch (error) {
    return Response.json({ error: toRouteErrorMessage(error) }, { status: 500 });
  }
}
