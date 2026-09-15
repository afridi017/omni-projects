import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const RESERVED_NAMES = new Set(["hujra", "room", "about"]);

const ROOM_PREFIXES = ["demo-", "room_", "live_"];

/**
 * GET /api/livekit?room=<slug>
 * Returns a LiveKit join token (name + identity).
 * Only active when LIVEKIT_API_KEY / LIVEKIT_API_SECRET are set —
 * otherwise UI stays in demo mode and this returns 501 with a hint.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("room") ?? "").trim();

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const lkUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !lkUrl) {
    return NextResponse.json(
      {
        error:
          "LiveKit not configured — running in demo mode. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, NEXT_PUBLIC_LIVEKIT_URL.",
      },
      { status: 501 },
    );
  }

  const room =
    ROOM_PREFIXES.some((p) => slug.startsWith(p)) || RESERVED_NAMES.has(slug)
      ? slug
      : `hujra_${slug}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: `user_${Math.random().toString(36).slice(2, 8)}`,
    name: "Hujra Guest",
    ttl: "2h",
  });
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();
  return NextResponse.json({ token, room });
}
