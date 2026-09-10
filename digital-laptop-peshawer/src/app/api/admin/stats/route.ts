import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAdminStats } from "@/lib/queries";

export async function GET(request: Request) {
  if (!requireAdmin(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
