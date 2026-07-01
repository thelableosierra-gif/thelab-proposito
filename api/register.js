// api/register.js
// Lee el siguiente código disponible del Google Sheet, lo marca como usado,
// y envía el código por email al participante + notificación a The Lab.

import { google } from 'googleapis';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Códigos - Uso Participantes';
// Los códigos empiezan en la fila 1 (sin fila de encabezados).
const RANGE = `${SHEET_NAME}!A1:D`;

function getSheetsClient() {
  // GOOGLE_PRIVATE_KEY is stored as base64 in Vercel to avoid line-break
  // corruption when pasting multi-line PEM keys into the dashboard.
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const decodedKey = Buffer.from(rawKey, 'base64').toString('utf-8');
  const privateKey = decodedKey.includes('BEGIN PRIVATE KEY')
    ? decodedKey
    : rawKey.replace(/\\n/g, '\n'); // fallback for a plain (non-base64) value

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, howHeard, lang } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Faltan datos: nombre o email.' });
  }

  try {
    const sheets = getSheetsClient();

    // 1. Leer todas las filas de códigos
    const readResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = readResult.data.values || [];

    // 2. Buscar el primer código sin usar (columna B vacía o distinta de "YES")
    let targetRowIndex = -1;
    let code = null;

    for (let i = 0; i < rows.length; i++) {
      const rowCode = rows[i][0];
      const used = rows[i][1];
      if (rowCode && (!used || used.trim().toUpperCase() !== 'YES')) {
        targetRowIndex = i;
        code = rowCode.trim();
        break;
      }
    }

    if (!code) {
      return res.status(409).json({
        error: 'No hay códigos disponibles en este momento. Contacta a The Lab.',
      });
    }

    // 3. Marcar el código como usado + escribir nombre y email
    const sheetRowNumber = targetRowIndex + 1; // +1 porque el rango empieza en la fila 1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!B${sheetRowNumber}:D${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['YES', name, email]],
      },
    });

    // 4. Enviar email al participante con su código
    const isEnglish = lang === 'en';

    await resend.emails.send({
      from: 'The Lab <noreply@jointhelab.org>',
      to: email,
      subject: isEnglish
        ? 'Your access code — Design Your Purpose'
        : 'Tu código de acceso — Diseña Tu Propósito',
      html: isEnglish
        ? `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
             <h2>Welcome to The Lab, ${name}!</h2>
             <p>Here is your personal access code for the "Design Your Purpose" guide:</p>
             <p style="font-size: 24px; font-weight: bold; background: #FFE600; padding: 12px 20px; display: inline-block; border-radius: 8px;">${code}</p>
             <p>Go to <a href="https://thelab-proposito-n1q9.vercel.app">thelab-proposito-n1q9.vercel.app</a> and enter your code to begin.</p>
             <p>— The Lab</p>
           </div>`
        : `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
             <h2>¡Bienvenido a The Lab, ${name}!</h2>
             <p>Este es tu código de acceso personal para la guía "Diseña Tu Propósito":</p>
             <p style="font-size: 24px; font-weight: bold; background: #FFE600; padding: 12px 20px; display: inline-block; border-radius: 8px;">${code}</p>
             <p>Ingresa a <a href="https://thelab-proposito-n1q9.vercel.app">thelab-proposito-n1q9.vercel.app</a> e introduce tu código para comenzar.</p>
             <p>— The Lab</p>
           </div>`,
    });

    // 5. Notificar a Leo
    await resend.emails.send({
      from: 'The Lab <noreply@jointhelab.org>',
      to: 'thelab.leosierra@gmail.com',
      subject: `Nuevo registro: ${name}`,
      html: `<div style="font-family: sans-serif;">
               <p><strong>Nombre:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Cómo conoció The Lab:</strong> ${howHeard || 'No especificado'}</p>
               <p><strong>Código asignado:</strong> ${code}</p>
             </div>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      error: 'Hubo un error procesando tu registro. Intenta de nuevo.',
    });
  }
}
