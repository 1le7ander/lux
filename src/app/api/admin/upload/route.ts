import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/server/auth";
import { uploadImage } from "@/server/apps-script";

export const runtime = "nodejs";
// Product images can be large; allow the full Node body size.
export const maxDuration = 30;

/**
 * POST /api/admin/upload
 *
 * Body: { filename: string, base64: string }
 *
 * Thin proxy: authenticates the admin session, then forwards the file to
 * the Apps Script web app which writes to Drive and returns a public URL.
 */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { filename?: string; base64?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.base64) {
    return NextResponse.json(
      { success: false, error: "No image data" },
      { status: 400 }
    );
  }

  const filename =
    body.filename && body.filename.length > 0
      ? body.filename
      : `luxe-${Date.now()}.jpg`;

  try {
    const { url, fileId } = await uploadImage({
      filename,
      base64: body.base64,
    });
    return NextResponse.json({ success: true, url, fileId });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 }
    );
  }
}
