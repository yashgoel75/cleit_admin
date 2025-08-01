import { NextRequest, NextResponse } from "next/server";
import { Society } from "../../../../../db/schema";

// POST: Add new team member
export async function POST(req: NextRequest) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to add member", details: error.message }, { status: 500 });
  }
}

// PATCH: Partially update a team member (by email)
export async function PATCH(req: NextRequest) {
  try {
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

    const memberIndex = society.team.findIndex((m: any) => m.email === memberEmail);
    if (memberIndex === -1) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    // Apply updates to the matched member
    Object.assign(society.team[memberIndex], updates);
    await society.save();

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update member", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a team member (by email)
export async function DELETE(req: NextRequest) {
  try {
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete member", details: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch society by email (to get team)
export async function GET(req: NextRequest) {
  try {
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch society", details: error.message },
      { status: 500 }
    );
  }
}
