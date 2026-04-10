/**
 * When a document is created in Firestore, append a row to Google Sheets.
 * Requires Blaze plan + secrets: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEET_ID
 * See docs/FIREBASE_SHEETS.md
 */
const { initializeApp } = require("firebase-admin/app");
const { Timestamp } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { defineSecret, defineString } = require("firebase-functions/params");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const formEmail = require("./formEmailPayload.cjs");

initializeApp();

const googleServiceAccountJson = defineSecret("GOOGLE_SERVICE_ACCOUNT_JSON");
const googleSheetId = defineSecret("GOOGLE_SHEET_ID");

/** Namecheap Private Email — use App Password if 2FA; TLS port 587 */
const smtpUser = defineSecret("SMTP_USER");
const smtpPass = defineSecret("SMTP_PASS");
const smtpHost = defineString("SMTP_HOST", { default: "mail.privateemail.com" });
const smtpPort = defineString("SMTP_PORT", { default: "587" });
const mailFrom = defineString("MAIL_FROM", { default: "admin@lunasenpantry.co.uk" });
const mailTo = defineString("MAIL_TO", { default: "admin@lunasenpantry.co.uk" });

const REGION = "europe-west2";

const ALLOWED_FORM_TYPES = new Set(["referral", "volunteer", "story"]);
const MAX_FORM_PAYLOAD_BYTES = 100_000;

function validateFormPayload(formType, data) {
  if (!ALLOWED_FORM_TYPES.has(formType)) {
    throw new HttpsError("invalid-argument", "Invalid form type.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new HttpsError("invalid-argument", "Invalid form data.");
  }
  let size = 0;
  try {
    size = Buffer.byteLength(JSON.stringify(data), "utf8");
  } catch {
    throw new HttpsError("invalid-argument", "Form data could not be encoded.");
  }
  if (size > MAX_FORM_PAYLOAD_BYTES) {
    throw new HttpsError("invalid-argument", "Form data too large.");
  }
}

async function sendFormSmtpMail(formType, data) {
  const user = smtpUser.value();
  const pass = smtpPass.value();
  if (!user || !pass) {
    logger.warn("SMTP_USER / SMTP_PASS not set; skip sendFormSmtpMail");
    throw new HttpsError("failed-precondition", "Email is not configured on the server.");
  }

  const port = Number.parseInt(String(smtpPort.value()), 10) || 587;
  const transporter = nodemailer.createTransport({
    host: smtpHost.value(),
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = formEmail.buildFormEmailSubject(formType);
  const html = formEmail.buildFormEmailHtml(formType, data);
  const text = formEmail.formatFormBodyPlain(formType, data);
  const replyTo = formEmail.formReplyToEmail(data);

  await transporter.sendMail({
    from: mailFrom.value(),
    to: mailTo.value(),
    subject,
    text,
    html,
    replyTo: replyTo || undefined,
  });
}

function formatDate(d) {
  if (!d) return "";
  if (d instanceof Timestamp) return d.toDate().toISOString();
  if (typeof d.toDate === "function") return d.toDate().toISOString();
  return String(d);
}

function joinList(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.join("; ");
  return String(v);
}

function buildReferralRow(docId, data) {
  return [
    docId,
    formatDate(data.createdAt),
    data.firstName || "",
    data.lastName || "",
    data.phone || "",
    data.email || "",
    data.postcode || "",
    data.contactPreference || "",
    data.adultsCount || "",
    data.childrenCount || "",
    data.childrenAges || "",
    data.urgencyLevel || "",
    joinList(data.supportType),
    joinList(data.householdItemRequests),
    data.hasSpecialNeeds ? "yes" : "no",
    (data.senNeedsDetails || "").slice(0, 500),
    (data.additionalComments || "").slice(0, 500),
    data.consentData ? "yes" : "no",
    data.preferredLanguage || "",
    data.preferredContact || "",
  ];
}

function buildVolunteerRow(docId, data) {
  return [
    docId,
    formatDate(data.createdAt),
    data.name || "",
    data.email || "",
    data.phone || "",
    data.role || "",
    data.availability || "",
    (data.experience || "").slice(0, 300),
    data.hasVehicle ? "yes" : "no",
    data.drivingLicense || "",
    data.canLiftHeavy ? "yes" : "no",
    data.consent ? "yes" : "no",
    (data.additionalInfo || "").slice(0, 500),
    data.startDate || "",
  ];
}

async function appendRow(tabName, row) {
  const rawJson = googleServiceAccountJson.value();
  const spreadsheetId = googleSheetId.value();
  if (!rawJson || !spreadsheetId) {
    logger.warn("Sheets secrets missing; skip append");
    return;
  }

  let credentials;
  try {
    credentials = JSON.parse(rawJson);
  } catch (e) {
    logger.error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON", e);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

exports.appendReferralToSheet = onDocumentCreated(
  {
    document: "referrals/{referralId}",
    secrets: [googleServiceAccountJson, googleSheetId],
    region: REGION,
  },
  async (event) => {
    const referralId = event.params.referralId;
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    try {
      const row = buildReferralRow(referralId, data);
      await appendRow("Referrals", row);
      logger.info("Referral row appended", { referralId });
    } catch (e) {
      logger.error("appendReferralToSheet failed", e);
    }
  }
);

exports.appendVolunteerToSheet = onDocumentCreated(
  {
    document: "volunteers/{volunteerId}",
    secrets: [googleServiceAccountJson, googleSheetId],
    region: REGION,
  },
  async (event) => {
    const volunteerId = event.params.volunteerId;
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    try {
      const row = buildVolunteerRow(volunteerId, data);
      await appendRow("Volunteers", row);
      logger.info("Volunteer row appended", { volunteerId });
    } catch (e) {
      logger.error("appendVolunteerToSheet failed", e);
    }
  }
);

/**
 * HTTPS callable — sends referral / volunteer / story notification via Private Email SMTP.
 * Requires Blaze + secrets SMTP_USER, SMTP_PASS (see .env.example in repo root).
 * Client: VITE_FORM_NOTIFY_CLOUD=true and same Firebase region (europe-west2).
 */
exports.sendFormNotificationEmail = onCall(
  {
    region: REGION,
    secrets: [smtpUser, smtpPass],
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const { formType, data } = request.data || {};
    validateFormPayload(formType, data);
    try {
      await sendFormSmtpMail(formType, data);
      logger.info("sendFormNotificationEmail sent", { formType, uid: request.auth.uid });
      return { ok: true };
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      logger.error("sendFormNotificationEmail failed", e);
      throw new HttpsError("internal", "Could not send email.");
    }
  }
);
