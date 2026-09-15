// api/verify-code.js
// Verifica un código de acceso contra el Google Sheet en vivo (no una lista
// fija). Si el código existe y fue emitido por el registro (columna B =
// "YES"), el código es válido.
//
// SECURITY FIX (Sept 2026): this endpoint used to return the participant's
// name and email in the response so the client could attach them to the
// final results email. That meant anyone who held (or guessed) a valid
// code — not necessarily its rightful owner — could retrieve another
// participant's PII with a single request. It now returns only whether
// the code is valid; name/email are re-derived server-side, from the
// code alone, at the point the results email is actually sent
// (see api/send-email.js), and are never exposed to the browser here.

import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1';
const RANGE = `${SHEET_NAME}!A1:D`;

function getSheetsClient() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const decodedKey = Buffer.from(rawKey, 'base64').toString('utf-8');
  const privateKey = decodedKey.includes('BEGIN PRIVATE KEY')
    ? decodedKey
    : rawKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body || {};
  const normalized = (code || '').trim().toUpperCase();

  if (!normalized) {
    return res.status(400).json({ valid: false, reason: 'empty' });
  }

  try {
    const sheets = getSheetsClient();
    const readResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = readResult.data.values || [];

    for (let i = 0; i < rows.length; i++) {
      const rowCode = (rows[i][0] || '').trim().toUpperCase();
      if (rowCode === normalized) {
        const used = (rows[i][1] || '').trim().toUpperCase();
        const email = rows[i][3] || '';

        if (used !== 'YES') {
          return res.status(200).json({ valid: false, reason: 'not_issued' });
        }
        if (!email) {
          return res.status(200).json({ valid: false, reason: 'no_contact' });
        }
        return res.status(200).json({ valid: true });
      }
    }

    return res.status(200).json({ valid: false, reason: 'not_found' });

  } catch (err) {
    console.error('Verify code error:', err);
    return res.status(500).json({ valid: false, reason: 'server_error' });
  }
}
