export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, email, telefono, proposito, pasion, mantra, valores, fortalezas, valorUnico, lang } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const isEN = lang === 'en';
  const valoresStr = Array.isArray(valores) ? valores.join(', ') : (valores || '');
  const fortalezasStr = Array.isArray(fortalezas) ? fortalezas.join(', ') : (fortalezas || '');

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
      <div style="background:#f5c800;padding:16px 24px;margin-bottom:24px">
        <h1 style="margin:0;font-size:18px">THE LAB &middot; LEO SIERRA</h1>
        <p style="margin:4px 0 0;font-size:13px">${isEN ? 'Your Life Purpose Summary' : 'Tu Resumen de Proposito'}</p>
      </div>
      <p>${isEN ? 'Hi' : 'Hola'} <strong>${nombre}</strong>,</p>
      <p>${isEN ? 'Here is your purpose discovery summary.' : 'Aqui esta tu resumen de proposito de vida.'}</p>
      ${mantra ? `<div style="background:#111;color:#f5c800;padding:16px;margin:16px 0;border-radius:4px"><strong>${isEN ? 'Purpose in One Sentence' : 'Proposito en Una Frase'}:</strong><br>${mantra}</div>` : ''}
      ${proposito ? `<div style="background:#f9f9f9;padding:16px;margin:16px 0;border-left:4px solid #f5c800"><strong>${isEN ? 'My Life Purpose' : 'Mi Proposito de Vida'}:</strong><br>${proposito}</div>` : ''}
      ${pasion ? `<p><strong>${isEN ? 'My Passion' : 'Mi Pasion'}:</strong> ${pasion}</p>` : ''}
      ${valoresStr ? `<p><strong>${isEN ? 'My Values' : 'Mis Valores'}:</strong> ${valoresStr}</p>` : ''}
      ${fortalezasStr ? `<p><strong>${isEN ? 'My Strengths' : 'Mis Fortalezas'}:</strong> ${fortalezasStr}</p>` : ''}
      ${valorUnico ? `<p><strong>${isEN ? 'My Unique Value' : 'Mi Valor Unico'}:</strong> ${valorUnico}</p>` : ''}
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
      <p style="color:#888;font-size:12px">The Lab &middot; Leo Sierra | ${telefono || ''}</p>
    </div>
  `;

  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Lab <onboarding@resend.dev>',
        to: [email],
        subject: isEN ? 'Your Life Purpose - The Lab' : 'Tu Proposito de Vida - The Lab',
        html: htmlBody
      })
    });

    if (!sendRes.ok) {
      const errData = await sendRes.json();
      console.error('Resend error:', errData);
      return res.status(500).json({ error: 'Error enviando email', detail: errData });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Send email exception:', error);
    return res.status(500).json({ error: 'Error enviando email' });
  }
}
