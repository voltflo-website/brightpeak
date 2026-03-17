import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sgMail from "@sendgrid/mail";

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "contact-submissions.json");
const NOTIFICATION_EMAIL = "brian.dolan@voltflo.com";

function loadSubmissions(): any[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveSubmissions(submissions: any[]) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

async function sendEmailNotification(submission: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  date: string;
}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return;

  sgMail.setApiKey(apiKey);

  const fullName = [submission.firstName, submission.lastName].filter(Boolean).join(" ");
  const dateStr = new Date(submission.date).toLocaleString("en-AU", { timeZone: "Australia/Sydney" });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a365d; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">New Contact Form Submission</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 12px; font-weight: bold; color: #374151; width: 120px;">Name</td><td style="padding: 8px 12px;">${fullName}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 12px; font-weight: bold; color: #374151;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${submission.email}">${submission.email}</a></td></tr>
        ${submission.phone ? `<tr><td style="padding: 8px 12px; font-weight: bold; color: #374151;">Phone</td><td style="padding: 8px 12px;"><a href="tel:${submission.phone}">${submission.phone}</a></td></tr>` : ""}
        ${submission.service ? `<tr style="background: #f9fafb;"><td style="padding: 8px 12px; font-weight: bold; color: #374151;">Service</td><td style="padding: 8px 12px;">${submission.service}</td></tr>` : ""}
        <tr><td style="padding: 8px 12px; font-weight: bold; color: #374151; vertical-align: top;">Message</td><td style="padding: 8px 12px; white-space: pre-wrap;">${submission.message}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 12px; font-weight: bold; color: #374151;">Received</td><td style="padding: 8px 12px;">${dateStr}</td></tr>
      </table>
      <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">This email was sent from the BrightPeak Energy website contact form.</p>
    </div>
  `;

  const textContent = `New Contact Form Submission\n\nName: ${fullName}\nEmail: ${submission.email}\nPhone: ${submission.phone || "N/A"}\nService: ${submission.service || "N/A"}\nMessage: ${submission.message}\nReceived: ${dateStr}`;

  await sgMail.send({
    to: NOTIFICATION_EMAIL,
    from: NOTIFICATION_EMAIL,
    replyTo: submission.email,
    subject: `BrightPeak Contact: ${fullName}`,
    text: textContent,
    html: htmlContent,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, service, message } = body;

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const submission = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      firstName,
      lastName: lastName || "",
      email,
      phone: phone || "",
      service: service || "",
      message,
      read: false,
    };

    const submissions = loadSubmissions();
    submissions.unshift(submission);
    saveSubmissions(submissions);

    try {
      await sendEmailNotification(submission);
    } catch (emailErr: any) {
      console.error("SendGrid email failed:", emailErr);
      if (emailErr?.response?.body) {
        console.error("SendGrid error details:", JSON.stringify(emailErr.response.body));
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
