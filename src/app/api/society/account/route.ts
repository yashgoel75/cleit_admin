import { NextResponse, NextRequest } from "next/server";
import { Society } from "../../../../../db/schema";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { register } from "@/instrumentation";

export async function PATCH(req: NextRequest) {
  await register();
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

export async function DELETE(req: NextRequest) {
  await register();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken || !decodedToken.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = decodedToken.email;

    const result = await Society.deleteOne({ email: userEmail });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No matching society found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/society/account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}