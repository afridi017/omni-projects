import { NextResponse } from "next/server";
import {
  MIN_PASSWORD_LENGTH,
  requireAdmin,
  rotateSessionSecret,
  setAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin";

/** GET — info about the current password state. */
export async function GET(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    minLength: MIN_PASSWORD_LENGTH,
  });
}

/** POST — change the admin password (requires current password). */
export async function POST(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
  };
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword) {
    return NextResponse.json(
      { error: "Please enter your current password." },
      { status: 400 },
    );
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      {
        error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }
  if (!(await verifyAdminPassword(currentPassword))) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  }

  await setAdminPassword(newPassword);
  await rotateSessionSecret();

  return NextResponse.json({
    ok: true,
    message: "Password changed. Please log in again.",
  });
}
