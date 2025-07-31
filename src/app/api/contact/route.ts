import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const { name, email, subject, body } = await req.json();

    try {
        await resend.emails.send({
            from: 'Cleit <connect@yashgoel.me>',
            to: email,
            subject: `We've received your message — Cleit Support`,
            html: `
        <img src="https://res.cloudinary.com/dqwjvwb8z/image/upload/v1753870491/cleit_ay8dhd.png" alt="Cleit Logo" style="width: 150px; height: auto; margin-bottom: 20px;">
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out to Cleit Support. We've received your message and will get back to you shortly.</p>
        <hr />
        <h3>Your message:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${body.replace(/\n/g, "<br>")}</p>
        <hr />
        <p>We’ll review your message and respond as soon as possible.</p>
        <p>Best regards,<br>Team Cleit</p>
      `,
        });

        // 2. Email to you (admin copy)
        await resend.emails.send({
            from: 'Cleit <connect@yashgoel.me>',
            to: 'yash.goel8370@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
        <h2>New support request received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${body.replace(/\n/g, "<br>")}</p>
        <hr />
        <p>This message was submitted via the Cleit support form.</p>
      `,
        });

        return NextResponse.json(
            { message: 'Support message sent to user and admin' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send emails' },
            { status: 500 }
        );
    }
}
