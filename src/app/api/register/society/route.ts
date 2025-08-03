import { NextRequest, NextResponse } from "next/server";
import { Society } from "../../../../../db/schema";
import argon2 from "argon2";
import { register } from "@/instrumentation";

export async function GET(req: NextRequest) {
  try {
    await register();
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (email) {
      const societyEmailExists = await Society.findOne({ email });

      return NextResponse.json({
        emailExists: !!(societyEmailExists),
      });
    }

    if (username) {
      const societyUsernameExists = await Society.findOne({ username });

      return NextResponse.json({
        usernameExists: !!(societyUsernameExists),
      });
    }

    return NextResponse.json(
      { error: "Please provide 'username' or 'email' to check." },
      { status: 400 }
    );
  } catch (e) {
    console.error("Validation error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
interface team {
  name: string,
  username: string,
  email: string,
  password: string
}
export async function POST(req: NextRequest) {
  const { name, username, email, password } = (await req.json()) as team;
  try {
    await register();
    if (!name || !username || !email || !password) {
      console.error("Missing entries");
      return NextResponse.json("Invalid Entry");
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json("Invalid Email Format!");
    }

    const society = await Society.create({
      name,
      username,
      email,
      password: await argon2.hash(password),
      about: "",
      website: "",
      team: [],
      social: [],
      events: [],
      auditionOpen: false,
      centralized: false,
      eligibility: []
    });

    console.log(society);
  } catch (e) {
    NextResponse.json("Error!");
  }

  return NextResponse.json({ ok: true });
}