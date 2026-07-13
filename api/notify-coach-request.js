// api/notify-coach-request.js
// Se usa cuando alguien ya recibió su reporte automáticamente y ADEMÁS pide
// hablar con un coach desde el formulario "Talk to a Coach". Esto NO reenvía
// el reporte completo ni duplica el registro en Respuestas — solo notifica a
// Leo con los datos de contacto para que pueda dar seguimiento.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nombre, email, telefono } = req.body || {};
  if (!nombre || !email) return res.status(400).json({ error: 'Faltan campos requeridos' });

  try {
    await resend.emails.send({
      from: 'The Lab <noreply@jointhelab.org>',
      to: 'thelab.leosierra@gmail.com',
      subject: '🗣️ Quiere hablar con un coach: ' + nombre,
      html: `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
               <h2>Solicitud de coaching</h2>
               <p><strong>Nombre:</strong> ${nombre}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
               <p style="color:#888;font-size:13px;">Esta persona ya completó la evaluación y recibió su reporte automáticamente. Este mensaje es solo para avisar que quiere profundizar con un coach.</p>
             </div>`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Coach notification error:', err);
    return res.status(500).json({ error: 'Error al notificar la solicitud.' });
  }
}
