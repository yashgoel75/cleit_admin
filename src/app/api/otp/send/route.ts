import redis from '@/lib/redis';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
const resend = new Resend('re_P5BHG8XZ_2Gz7tD25q5KmAq1wCfwJLamT');

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, {
        ex: 300,
    });

    try {
        const { data } = await resend.emails.send({
            from: "Cleit <connect@yashgoel.me>",
            to: email,
            subject: "Welcome to Cleit Admin     - OTP Verification",
            html: `
                <img src="https://res.cloudinary.com/dqwjvwb8z/image/upload/v1753870491/cleit_ay8dhd.png" alt="Cleit Logo" style="width: 150px; height: auto; margin-bottom: 20px;">
                <h1>Welcome to Cleit!</h1>
                <p>Thank you for registering with Cleit. Please use this OTP to verify your email:</p>
                <h2 style="font-size: 24px; font-weight: bold;">${otp}</h2>
                <p>This OTP is valid for <strong>5 minutes.</strong></p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>Team Cleit</p>
            `,
        });

        return NextResponse.json(
            { message: "Email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}