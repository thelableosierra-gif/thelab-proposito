import { google } from 'googleapis';

function getSheetsClient() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const decodedKey = Buffer.from(rawKey, 'base64').toString('utf-8');
  const privateKey = decodedKey.includes('BEGIN PRIVATE KEY')
    ? decodedKey
    : rawKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function logToRespuestas(row) {
  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Respuestas!A1:M1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });
  } catch (e) {
    console.error('Respuestas log error:', e.message || e);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { nombre, email, telefono, proposito, pasion, mantra, valores, fortalezas, valorUnico, why, location, identityResponses, passionAnswers, strengthColor, lang } = req.body;
  if (!nombre || !email) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const isEN = lang === 'en';
  const vStr = Array.isArray(valores) ? valores.join(', ') : (valores || '');
  const fStr = Array.isArray(fortalezas) ? fortalezas.join(', ') : (fortalezas || '');
  const locationMap = { confundido: isEN ? 'Confused' : 'Confundido', frustrado: isEN ? 'Frustrated' : 'Frustrado', realizado: isEN ? 'Fulfilled' : 'Realizado' };
  const locationLabel = locationMap[location] || location || '';
  function row(label, value) {
    if (!value) return '';
    return '<div style="margin-bottom:16px"><p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700">' + label + '</p><p style="margin:0;font-size:14px;color:#333;line-height:1.6">' + value + '</p></div>';
  }
  function section(title) {
    return '<div style="border-top:2px solid #f5c800;margin:24px 0 16px;padding-top:12px"><p style="margin:0;font-size:11px;letter-spacing:2px;font-weight:800;color:#111">' + title + '</p></div>';
  }
  function buildHTML() {
    let h = '<div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#111">';
    h += '<div style="background:#f5c800;padding:24px 32px"><h1 style="margin:0;font-size:20px">THE LAB &middot; LEO SIERRA</h1><p style="margin:4px 0 0;font-size:13px">' + (isEN ? 'Life Purpose Full Report' : 'Reporte Completo de Proposito') + '</p></div>';
    h += '<div style="background:#111;padding:16px 32px"><p style="color:#f5c800;margin:0;font-size:12px;letter-spacing:1px">' + (isEN ? 'PARTICIPANT' : 'PARTICIPANTE') + '</p>';
    h += '<p style="color:#fff;margin:4px 0 0;font-size:16px;font-weight:600">' + nombre + '</p>';
    h += '<p style="color:#aaa;margin:2px 0 0;font-size:13px">' + email + (telefono ? ' &middot; ' + telefono : '') + '</p></div>';
    h += '<div style="padding:32px">';
    if (mantra) h += '<div style="background:#f9f5e0;border-left:4px solid #f5c800;padding:20px;margin-bottom:24px"><p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700">' + (isEN ? 'PURPOSE IN ONE SENTENCE' : 'PROPOSITO EN UNA FRASE') + '</p><p style="margin:0;font-size:18px;font-weight:700;line-height:1.5">' + mantra + '</p></div>';
    if (proposito) h += '<div style="background:#111;color:#fff;padding:20px;margin-bottom:24px;border-radius:4px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:#f5c800;font-weight:700">' + (isEN ? 'MY LIFE PURPOSE' : 'MI PROPOSITO DE VIDA') + '</p><p style="margin:0;font-size:15px;line-height:1.7">' + proposito + '</p></div>';
    h += section(isEN ? 'STEP 1 - LOCATION' : 'PASO 1 - UBICACION');
    h += row(isEN ? 'Current State' : 'Estado Actual', locationLabel);
    h += row(isEN ? 'Why Purpose Matters (Reflection)' : 'Por que el Proposito Importa (Reflexion)', why);
    h += section(isEN ? 'STEP 2 - IDENTITY' : 'PASO 2 - IDENTIDAD');
    h += row(isEN ? 'Core Values' : 'Valores Principales', vStr);
    if (Array.isArray(identityResponses) && identityResponses.length) {
      identityResponses.forEach(function(r) {
        if (r && r.q1) h += row(r.territory || '', r.q1 + (r.q2 ? ' [' + (isEN ? 'Values' : 'Valores') + ': ' + r.q2 + ']' : ''));
      });
    }
    h += section(isEN ? 'STEP 3 - PASSION' : 'PASO 3 - PASION');
    h += row(isEN ? 'Passion Statement' : 'Declaracion de Pasion', pasion);
    if (passionAnswers && typeof passionAnswers === 'object') {
      h += row(isEN ? 'What moves you deeply' : 'Lo que te mueve profundamente', passionAnswers.q1 || passionAnswers.q2 || '');
    }
    h += section(isEN ? 'STEP 4 - STRENGTHS' : 'PASO 4 - FORTALEZAS');
    h += row(isEN ? 'Strength Profile' : 'Perfil de Fortalezas', strengthColor ? (strengthColor.charAt(0).toUpperCase() + strengthColor.slice(1)) : '');
    h += row(isEN ? 'My Strengths' : 'Mis Fortalezas', fStr);
    h += section(isEN ? 'STEP 5 - UNIQUE VALUE' : 'PASO 5 - VALOR UNICO');
    h += row(isEN ? 'Unique Value to Others' : 'Valor Unico para Otros', valorUnico);
    h += '</div><div style="background:#f5f5f5;padding:16px 32px;text-align:center"><p style="margin:0;font-size:11px;color:#999">The Lab &middot; Leo Sierra &middot; jointhelab.org</p></div></div>';
    return h;
  }
  const FROM = 'The Lab <noreply@jointhelab.org>';
  const subj1 = isEN ? 'Your Life Purpose Report - The Lab' : 'Tu Reporte de Proposito - The Lab';
  const subj2 = 'Nuevo participante: ' + nombre;
  const h = buildHTML();

  async function sendOne(to, subject) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [to], subject: subject, html: h })
      });
      if (!r.ok) {
        const e = await r.json();
        return { ok: false, error: e };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  const [participantResult, labResult] = await Promise.all([
    sendOne(email, subj1),
    sendOne('thelab.leosierra@gmail.com', subj2)
  ]);

  await logToRespuestas([
    new Date().toISOString(),
    nombre,
    email,
    lang || '',
    proposito || '',
    mantra || '',
    vStr,
    pasion || '',
    strengthColor || '',
    fStr,
    valorUnico || '',
    why || '',
    locationLabel
  ]);

  const status = (participantResult.ok && labResult.ok) ? 200 : 207;
  return res.status(status).json({
    participant: participantResult,
    lab: labResult
  });
}
