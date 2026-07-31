import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { createSession, setSessionCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };
    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";

    if (!email || !password) {
      return Response.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
      return Response.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }
    if (!user.active) {
      return Response.json({ error: "Esta cuenta fue desactivada" }, { status: 403 });
    }

    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        initials: user.initials,
        role: user.role,
        area: user.area,
        color: user.color,
        email: user.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
