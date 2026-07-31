import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { forbidden, getCurrentUser, unauthorized } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (currentUser.role !== "Administrador") return forbidden();

    const payload = (await request.json()) as { id?: string };
    const id = payload.id?.trim() ?? "";

    if (!id) {
      return Response.json({ error: "Falta el id" }, { status: 400 });
    }
    if (id === currentUser.id) {
      return Response.json(
        { error: "No podés desactivar tu propia cuenta" },
        { status: 400 },
      );
    }

    const db = getDb();
    const [target] = await db.select().from(users).where(eq(users.id, id));
    if (!target) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const nextActive = target.active ? 0 : 1;
    await db.update(users).set({ active: nextActive }).where(eq(users.id, id));

    return Response.json({ active: Boolean(nextActive) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
