import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, otp: inputOtp } = await req.json();

  const storedOtp = await redis.get(`otp:${email}`);

  if (storedOtp === inputOtp) {
    await redis.del(`otp:${email}`);
    return NextResponse.json({ verified: true }, { status: 200 });
  } else {
    return NextResponse.json({ verified: false }, { status: 400 });
  }
}