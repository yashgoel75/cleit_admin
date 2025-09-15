import { NextResponse } from "next/server";
import { Society } from "../../../../../../db/schema";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { register } from "@/instrumentation";

export async function POST(req) {
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
      return NextResponse.json(
        { error: "societyEmail and newMember are required" },
        { status: 400 }
      );
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
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
    const { memberId } = params;
    const { societyEmail, updates } = await req.json();

    if (!societyEmail || !memberId) {
      return NextResponse.json(
        { error: "societyEmail and memberId are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOneAndUpdate(
      { email: societyEmail, "team._id": memberId },
      {
        $set: {
          "team.$.name": updates.name,
          "team.$.designation": updates.designation,
          "team.$.mobile": updates.mobile,
          "team.$.email": updates.email,
        },
      },
      { new: true }
    ).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society or member not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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
    const { searchParams } = new URL(req.url);
    const societyEmail = searchParams.get("societyEmail");
    const memberId = params.memberId;

    if (!societyEmail || !memberId) {
      return NextResponse.json(
        { error: "societyEmail and memberId are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOneAndUpdate(
      { email: societyEmail },
      { $pull: { team: { _id: memberId } } },
      { new: true }
    ).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society or member not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}

export async function GET(req) {
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch society" }, { status: 500 });
  }
}
