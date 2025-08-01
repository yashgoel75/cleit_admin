import { NextResponse, NextRequest } from "next/server";
import { Society } from "../../../../../db/schema";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { societyEmail, updates } = body;

  const updatedSociety = await Society.findOneAndUpdate(
    { email: societyEmail },
    updates,
    { new: true }
  );

  return NextResponse.json({ success: true, society: updatedSociety });
}

export function handler() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
