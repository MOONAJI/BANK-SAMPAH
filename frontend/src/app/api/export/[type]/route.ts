// Unduh CSV laporan. Token ada di cookie httpOnly, jadi route ini yang meneruskan
// request ke backend dengan header Authorization.
// Contoh: /api/export/deposits?startDate=2026-11-01&endDate=2026-11-30

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { API_URL } from "@/lib/config";
import { TOKEN_COOKIE } from "@/lib/auth/token";

const TYPES = ["deposits", "ledger"];

export async function GET(request: NextRequest, ctx: RouteContext<"/api/export/[type]">) {
  const { type } = await ctx.params;
  if (!TYPES.includes(type)) return new Response("Not found", { status: 404 });

  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/reports/export/${type}${request.nextUrl.search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return new Response("Server backend tidak dapat dihubungi.", { status: 503 });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
      "Content-Disposition": upstream.headers.get("content-disposition") ?? `attachment; filename="${type}.csv"`,
    },
  });
}
