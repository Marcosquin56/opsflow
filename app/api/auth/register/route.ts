import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { createSession, hashPassword, setSessionCookie } from "../../../../lib/auth";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = payload.name?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";

    if (!name || !email || !password) {
      return Response.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    const db = getDb();
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing) {
      return Response.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      name,
      initials: initialsFor(name),
      role: "Solicitante",
      area: "General",
      color: "blue",
    });

    const { token, expiresAt } = await createSession(id);
    await setSessionCookie(token, expiresAt);

    return Response.json(
      {
        user: {
          id,
          name,
          initials: initialsFor(name),
          role: "Solicitante",
          area: "General",
          color: "blue",
          email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
