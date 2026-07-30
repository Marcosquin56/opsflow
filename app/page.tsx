import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { DashboardView, type CurrentUser } from "./dashboard-view";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const currentUser: CurrentUser = {
    id: user.id,
    name: user.name,
    initials: user.initials,
    role: user.role as CurrentUser["role"],
    area: user.area,
    color: user.color,
    email: user.email,
  };

  return <DashboardView currentUser={currentUser} />;
}
