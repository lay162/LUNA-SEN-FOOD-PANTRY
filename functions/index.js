/**
 * When a document is created in Firestore, append a row to Google Sheets.
 * Requires Blaze plan + secrets: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEET_ID
 * See docs/FIREBASE_SHEETS.md
 */
const { initializeApp } = require("firebase-admin/app");
const { Timestamp } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { google } = require("googleapis");

initializeApp();

const googleServiceAccountJson = defineSecret("GOOGLE_SERVICE_ACCOUNT_JSON");
const googleSheetId = defineSecret("GOOGLE_SHEET_ID");

const REGION = "europe-west2";

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
