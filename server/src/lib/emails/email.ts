import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = "Dortrl <onboarding@resend.dev>";

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}
export async function sendEmail({ to, subject, text, html }: EmailParams) {
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: subject || "Hello from Resend!",
    html:
      html ?? "<h1>Welcome!</h1><p>This email was sent using Resend SDK.</p>",
    text:
      text ??
      "Welcome to Dortrl! A FREE URL shortener and link management system",
  });

  if (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending mail");
  } else {
    console.log("Email accepted by Resend:", data);
  }
}
