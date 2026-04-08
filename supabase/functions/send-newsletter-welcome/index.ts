import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  email: string;
}

const generateWelcomeEmailHtml = (): string => {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bienvenue</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#000000; padding:24px; text-align:center;">
            <h1 style="margin:0; color:#d4af37; font-size:22px; letter-spacing:1px;">
              Bienvenue
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px; color:#333333; font-size:15px; line-height:1.6;">
            <p style="margin-top:0;">
              Bonjour,
            </p>
            <p>
              Merci de vous être inscrit(e) à notre newsletter.
            </p>
            <p>
              Vous recevrez nos nouveautés, offres exclusives et annonces importantes,
              directement dans votre boîte mail.
            </p>
            <p>
              Pas de spam. Juste l'essentiel.
            </p>
            <p style="margin-bottom:0;">
              À très bientôt,<br>
              <strong>L'équipe</strong>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f0f0f0; padding:20px; text-align:center; font-size:12px; color:#777777;">
            Vous recevez cet email suite à votre inscription sur notre site.<br>
            Si ce n'est pas le cas, ignorez simplement ce message.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Sending welcome email to: ${email}`);

    // Configure Gmail SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Deno.env.get("GMAIL_USER"),
        pass: Deno.env.get("GMAIL_APP_PASSWORD"),
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"MyLady" <${Deno.env.get("GMAIL_USER")}>`,
      to: email,
      subject: "Bienvenue à notre newsletter !",
      html: generateWelcomeEmailHtml(),
    });

    console.log("Welcome email sent successfully:", info.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending welcome email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
