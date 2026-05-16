export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { nombre, email, telefono, proposito, pasion, mantra, valores, fortalezas, valorUnico, lang } = req.body;
  if (!nombre || !email) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const isEN = lang === 'en';
  const vStr = Array.isArray(valores) ? valores.join(', ') : (valores || '');
  const fStr = Array.isArray(fortalezas) ? fortalezas.join(', ') : (fortalezas || '');
  const FROM = 'The Lab <noreply@jointhelab.org>';
  const subj1 = isEN ? 'Your Life Purpose - The Lab' : 'Tu Proposito de Vida - The Lab';
  const subj2 = 'Nuevo participante: ' + nombre;
  function buildHTML() {
    return '<div style="font-family:sans-serif;max-width:600px;margin:0 auto">'
      + '<div style="background:#f5c800;padding:20px"><h2 style="margin:0">THE LAB · LEO SIERRA</h2></div>'
      + '<div style="background:#111;padding:16px"><p style="color:#f5c800;margin:0;font-size:12px">' + (isEN?'PARTICIPANT':'PARTICIPANTE') + '</p>'
      + '<p style="color:#fff;margin:4px 0 0">' + nombre + '</p>'
      + '<p style="color:#aaa;margin:2px 0 0;font-size:13px">' + email + (telefono?' · '+telefono:'') + '</p></div>'
      + '<div style="padding:24px">'
      + (mantra ? '<div style="background:#fffbe6;border-left:4px solid #f5c800;padding:16px;margin-bottom:16px"><strong>' + (isEN?'Purpose in One Sentence':'Proposito en Una Frase') + '</strong><p style="margin:8px 0 0">' + mantra + '</p></div>' : '')
      + (proposito ? '<div style="margin-bottom:16px"><strong>' + (isEN?'My Life Purpose':'Mi Proposito de Vida') + '</strong><p style="margin:8px 0 0;background:#f9f9f9;padding:12px">' + proposito + '</p></div>' : '')
      + (pasion ? '<div style="margin-bottom:12px"><strong>' + (isEN?'My Passion':'Mi Pasion') + '</strong><p style="margin:6px 0 0">' + pasion + '</p></div>' : '')
      + (vStr ? '<div style="margin-bottom:12px"><strong>' + (isEN?'My Values':'Mis Valores') + '</strong><p style="margin:6px 0 0">' + vStr + '</p></div>' : '')
      + (fStr ? '<div style="margin-bottom:12px"><strong>' + (isEN?'My Strengths':'Mis Fortalezas') + '</strong><p style="margin:6px 0 0">' + fStr + '</p></div>' : '')
      + (valorUnico ? '<div style="margin-bottom:12px"><strong>' + (isEN?'My Unique Value':'Mi Valor Unico') + '</strong><p style="margin:6px 0 0">' + valorUnico + '</p></div>' : '')
      + '</div><div style="background:#f5f5f5;padding:12px;text-align:center;font-size:11px;color:#999">The Lab · jointhelab.org</div></div>';
  }
  try {
    const h = buildHTML();
    const r1 = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [email], subject: subj1, html: h }) });
    if (!r1.ok) { const e = await r1.json(); return res.status(500).json({ error: 'Error participant', detail: e }); }
    const r2 = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: FROM, to: ['thelab.leosierra@gmail.com'], subject: subj2, html: h }) });
    if (!r2.ok) { const e = await r2.json(); return res.status(500).json({ error: 'Error lab', detail: e }); }
    return res.status(200).json({ ok: true });
  } catch(e) { return res.status(500).json({ error: 'Exception', detail: e.message }); }
}
