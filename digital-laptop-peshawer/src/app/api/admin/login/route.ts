import { NextResponse } from "next/server";
import { isAdminKeyValid } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (isAdminKeyValid(body.password)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
}
