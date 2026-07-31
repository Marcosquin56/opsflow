import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { forbidden, getCurrentUser, unauthorized } from "../../../../lib/auth";

const VALID_ROLES = ["Administrador", "Analista", "Solicitante"];

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (currentUser.role !== "Administrador") return forbidden();

    const payload = (await request.json()) as { id?: string; role?: string };
    const id = payload.id?.trim() ?? "";
    const role = payload.role?.trim() ?? "";

    if (!id || !VALID_ROLES.includes(role)) {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (id === currentUser.id) {
      return Response.json(
        { error: "No podés cambiar tu propio rol" },
        { status: 400 },
      );
    }

    const db = getDb();
    const [target] = await db.select().from(users).where(eq(users.id, id));
    if (!target) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await db.update(users).set({ role }).where(eq(users.id, id));

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
