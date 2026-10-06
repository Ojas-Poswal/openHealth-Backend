import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

/**
 * Outbound mail.
 *
 * The one-time codes for registration and password reset are the only thing
 * openHealth emails, so this module owns both the transport and the message
 * templates. Credentials come from the environment (Mailtrap's sandbox by
 * default) and when they are missing the transport is skipped with a warning
 * instead of throwing, so the API still boots before mail is set up.
 */

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

const port = Number(SMTP_PORT) || 2525;

const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = configured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

const FROM = MAIL_FROM || "openHealth <no-reply@openhealth.app>";

console.log(
  configured
    ? `Mail ready: one-time codes will be sent through ${SMTP_HOST}`
    : "Mail not configured: set SMTP_HOST, SMTP_USER and SMTP_PASS in .env, or OTP emails will be skipped",
);

const COPY = {
  "patient-register": {
    subject: "Verify your openHealth email",
    heading: "Confirm your email address",
    intro: "Use the code below to finish creating your openHealth patient account.",
  },
  "doctor-register": {
    subject: "Verify your openHealth doctor account",
    heading: "Confirm your email address",
    intro: "Use the code below to finish creating your openHealth doctor account.",
  },
  "patient-reset": {
    subject: "Reset your openHealth password",
    heading: "Reset your password",
    intro: "Use the code below to set a new password on your openHealth patient account.",
  },
  "doctor-reset": {
    subject: "Reset your openHealth doctor password",
    heading: "Reset your password",
    intro: "Use the code below to set a new password on your openHealth doctor account.",
  },
};

const buildBody = ({ heading, intro, otp, name }) => `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:32rem;margin:0 auto;padding:2rem;color:#0f172a">
    <h2 style="margin:0 0 .5rem;font-size:1.25rem">${heading}</h2>
    <p style="margin:0 0 1.25rem;line-height:1.6;color:#475569">
      ${name ? `Hello ${name}, ` : ""}${intro}
    </p>
    <p style="margin:0 0 1.25rem;padding:1rem 1.5rem;background:#f1f5f9;border-radius:.75rem;
              font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:2rem;
              letter-spacing:.35em;text-align:center;font-weight:700">${otp}</p>
    <p style="margin:0;line-height:1.6;color:#64748b;font-size:.875rem">
      This code expires in 10 minutes. If you did not request it, you can ignore this email —
      nothing will change on your account.
    </p>
  </div>
`;

/** True when SMTP credentials are present, so callers can report accurately. */
export const isMailConfigured = () => configured;

/**
 * @param {{ to: string, otp: string, purpose: keyof typeof COPY, name?: string }} input
 * @returns {Promise<boolean>} whether the message was handed to the transport
 */
export const sendOtpEmail = async ({ to, otp, purpose, name }) => {
  const copy = COPY[purpose] ?? COPY["patient-register"];

  if (!configured) {
    console.warn(
      `[mail] SMTP is not configured — skipped "${copy.subject}" to ${to}. ` +
        `Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env to send it.`,
    );
    return false;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: copy.subject,
    html: buildBody({ heading: copy.heading, intro: copy.intro, otp, name }),
  });

  return true;
};

export default sendOtpEmail;
