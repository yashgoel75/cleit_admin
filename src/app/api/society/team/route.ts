import { NextRequest, NextResponse } from "next/server";
import { Society } from "../../../../../db/schema";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { register } from "@/instrumentation";

interface member {
  name: string,
  designation: string,
  mobile: string,
  email: string
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await register();
    const { societyEmail, newMember } = await req.json();

    if (!societyEmail || !newMember) {
      return NextResponse.json({ error: "societyEmail and newMember are required" }, { status: 400 });
    }

    const society = await Society.findOneAndUpdate(
      { email: societyEmail },
      { $push: { team: newMember } },
      { new: true }
    ).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

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
  try {
    await register();
    const { societyEmail, memberEmail, updates } = await req.json();

    if (!societyEmail || !memberEmail || typeof updates !== "object") {
      return NextResponse.json(
        { error: "societyEmail, memberEmail, and updates are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOne({ email: societyEmail }).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const memberIndex = society.team.findIndex((m: member) => m.email === memberEmail);
    if (memberIndex === -1) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    Object.assign(society.team[memberIndex], updates);
    await society.save();

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await register();
    const { societyEmail, memberEmail } = await req.json();

    if (!societyEmail || !memberEmail) {
      return NextResponse.json(
        { error: "societyEmail and memberEmail are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOneAndUpdate(
      { email: societyEmail },
      { $pull: { team: { email: memberEmail } } },
      { new: true }
    ).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society or member not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await register();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const society = await Society.findOne({ email }).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch society" },
      { status: 500 }
    );
  }
}


