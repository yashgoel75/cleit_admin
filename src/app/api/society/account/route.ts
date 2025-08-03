import { NextResponse, NextRequest } from "next/server";
import { Society } from "../../../../../db/schema";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { societyEmail, updates } = body;

  const updatedSociety = await Society.findOneAndUpdate(
    { email: societyEmail },
    updates,
    { new: true }
  );

  return NextResponse.json({ success: true, society: updatedSociety });
}
