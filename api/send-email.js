export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, summary, lang } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const isEN = lang === 'en';

  const subjectLine = isEN
    ? 'Your Life Purpose — The Lab'
    : 'Tu Proposito de Vida — The Lab';

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#111">${isEN ? 'Your Life Purpose' : 'Tu Proposito de Vida'}</h2>
      <p style="color:#444">${isEN ? 'Hi' : 'Hola'} ${name},</p>
      <p style="color:#444">${isEN ? 'Here is the summary from your purpose discovery session with The Lab.' : 'Aqui esta el resumen de tu sesion con The Lab.'}</p>
      <div style="background:#f9f9f9;border-left:4px solid #f5c800;padding:16px;margin:24px 0;white-space:pre-wrap;color:#222">
        ${summary || (isEN ? 'No summary available.' : 'Sin resumen disponible.')}
      </div>
      <p style="color:#888;font-size:13px">The Lab · Leo Sierra</p>
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
        subject: subjectLine,
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
