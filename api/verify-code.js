// api/verify-code.js
// Verifica un código de acceso contra el Google Sheet en vivo (no una lista
// fija). Si el código existe y fue emitido por el registro (columna B =
// "YES"), devuelve el nombre y email asociados para poder enviar el reporte
// automáticamente al terminar la evaluación.

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
        const name = rows[i][2] || '';
        const email = rows[i][3] || '';

        if (used !== 'YES') {
          return res.status(200).json({ valid: false, reason: 'not_issued' });
        }
        if (!email) {
          return res.status(200).json({ valid: false, reason: 'no_contact' });
        }
        return res.status(200).json({ valid: true, name, email });
      }
    }

    return res.status(200).json({ valid: false, reason: 'not_found' });

  } catch (err) {
    console.error('Verify code error:', err);
    return res.status(500).json({ valid: false, reason: 'server_error' });
  }
}
