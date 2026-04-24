import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/server/auth";
import { deleteProduct } from "@/server/apps-script";
import { env } from "@/server/env";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  if (!env.APPS_SCRIPT_URL) {
    return NextResponse.json({ success: true, offline: true });
  }
  try {
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 }
    );
  }
}
