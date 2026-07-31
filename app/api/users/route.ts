import { getDb } from "../../../db";
import { requests, users } from "../../../db/schema";
import { getCurrentUser, unauthorized } from "../../../lib/auth";

const ROLE_ORDER: Record<string, number> = {
  Administrador: 0,
  Analista: 1,
  Solicitante: 2,
};

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();

    const db = getDb();
    const [userRows, requestRows] = await Promise.all([
      db.select().from(users),
      db.select({ assigneeInitials: requests.assigneeInitials, status: requests.status }).from(
        requests,
      ),
    ]);

    const members = userRows
      .map((user) => {
        const assigned = requestRows.filter((row) => row.assigneeInitials === user.initials);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials,
          role: user.role,
          area: user.area,
          color: user.color,
          active: Boolean(user.active),
          activeRequests: assigned.filter((row) => row.status !== "Resuelto").length,
          resolvedRequests: assigned.filter((row) => row.status === "Resuelto").length,
        };
      })
      .sort((a, b) => {
        const roleDiff = (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99);
        return roleDiff !== 0 ? roleDiff : a.name.localeCompare(b.name);
      });

    return Response.json({ users: members });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
