import { NextResponse } from "next/server";
import { createSessionToken, verifyAdminPassword } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
  };
  const password = typeof body.password === "string" ? body.password : "";

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json(
      { error: "Invalid admin password." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    token: await createSessionToken(),
  });
}
