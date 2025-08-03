import { NextRequest, NextResponse } from "next/server";
import { Society } from "../../../../../db/schema";
import { Types } from "mongoose";

interface eventContact {
  name: string,
  designation: string,
  mobile: string,
  email: string,
}

interface event {
  _id: Types.ObjectId;
  title: string,
  type: string,
  startDate: string,
  endDate: string,
  venue: string,
  time: string,
  about: string,
  contact: [eventContact],
  socialGroup: string,
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const societyEmail = searchParams.get("email");

    if (!societyEmail) {
      return NextResponse.json({ error: "societyEmail is required" }, { status: 400 });
    }

    const society = await Society.findOne({ email: societyEmail }).select("-password");
    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    return NextResponse.json({ events: society.events }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { societyEmail, newEvent } = await req.json();

    if (!societyEmail || !newEvent) {
      return NextResponse.json(
        { error: "societyEmail and newEvent are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOneAndUpdate(
      { email: societyEmail },
      { $push: { events: newEvent } },
      { new: true }
    ).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to add event" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { societyEmail, eventId, updates } = await req.json();

    if (!societyEmail || !eventId || typeof updates !== "object") {
      return NextResponse.json(
        { error: "societyEmail, eventId, and updates are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOne({ email: societyEmail }).select("-password");
    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const eventIndex = society.events.findIndex((event: event) => event._id.toString() === eventId);
    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    Object.assign(society.events[eventIndex], updates);
    await society.save();

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { societyEmail, eventId } = await req.json();

    if (!societyEmail || !eventId) {
      return NextResponse.json(
        { error: "societyEmail and eventId are required" },
        { status: 400 }
      );
    }

    const society = await Society.findOneAndUpdate(
      { email: societyEmail },
      { $pull: { events: { _id: eventId } } },
      { new: true }
    ).select("-password");

    if (!society) {
      return NextResponse.json({ error: "Society or event not found" }, { status: 404 });
    }

    return NextResponse.json({ society }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
