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
