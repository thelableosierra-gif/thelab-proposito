export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, email, telefono, proposito, mantra, valores, pasion, fortalezas, valorUnico, lang } = req.body;

  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // Language-aware labels
  const isEN = lang === 'en';
  const labels = {
    brandTag:     isEN ? 'The Lab · Leo Sierra' : 'The Lab · Leo Sierra',
    participant:  isEN ? 'Participant' : 'Participante',
    mantraLabel:  isEN ? '⚡ Purpose in One Sentence' : '⚡ Propósito en Una Frase',
    purposeLabel: isEN ? '✦ My Life Purpose' : '✦ Mi Propósito de Vida',
    valuesLabel:  isEN ? 'My Values' : 'Mis Valores',
    mainTag:      isEN ? 'MAIN' : 'PRINCIPAL',
    passionLabel: isEN ? 'My Passion' : 'Mi Pasión',
    strengthsLbl: isEN ? 'My Strengths' : 'Mis Fortalezas',
    uvLabel:      isEN ? 'My Unique Value' : 'Mi Valor Único',
    nextSteps:    isEN ? 'Next Steps' : 'Próximos Pasos',
    steps: isEN ? [
      'Keep your purpose visible — write it where you see it every day.',
      'Identify ONE decision this week aligned with your purpose.',
      'Share your purpose with someone you trust.',
      'Work with a coach to turn it into a concrete action plan.'
    ] : [
      'Mantén tu propósito visible — escríbelo donde lo veas cada día.',
      'Identifica UNA decisión esta semana alineada con tu propósito.',
      'Comparte tu propósito con alguien de confianza.',
      'Trabaja con un coach para convertirlo en un plan concreto.'
    ],
    subjectToLeo: isEN ? `New participant: ${nombre} — Design Your Purpose` : `Nuevo participante: ${nombre} — Diseña Tu Propósito`,
    subjectToUser: isEN ? 'Your Life Purpose — The Lab' : 'Tu Propósito de Vida — The Lab',
    footer: isEN ? 'The Lab · Leo Sierra — Design Your Purpose' : 'The Lab · Leo Sierra — Diseña Tu Propósito',
  };

  const summaryHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#FFE600;padding:32px 32px 24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#555;margin-bottom:8px;">${labels.brandTag}</div>
        <div style="font-size:28px;font-weight:900;color:#111;line-height:1;">${isEN ? 'PURPOSE' : 'PROPÓSITO'}</div>
        <div style="font-size:13px;color:#333;margin-top:4px;">${isEN ? 'Design an Extraordinary Life in 6 Steps' : 'Diseña una Vida Extraordinaria en 6 Pasos'}</div>
      </div>
      <div style="background:#111;padding:20px 32px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#FFE600;margin-bottom:6px;">${labels.participant}</div>
        <div style="font-size:16px;font-weight:700;color:#fff;">${nombre}</div>
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:2px;">${email} · ${telefono}</div>
      </div>
      <div style="padding:32px;">
        ${mantra ? `
        <div style="border:2px solid #FFE600;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a7000;margin-bottom:10px;">${labels.mantraLabel}</div>
          <div style="font-size:17px;font-style:italic;font-weight:600;color:#111;line-height:1.5;">${mantra}</div>
        </div>` : ''}
        <div style="border-top:3px solid #111;border-bottom:3px solid #111;padding:20px 0;margin-bottom:24px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a7000;margin-bottom:10px;">${labels.purposeLabel}</div>
          <div style="font-size:15px;font-style:italic;line-height:1.7;color:#111;">${proposito || ''}</div>
        </div>
        ${valores && valores.length ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">${labels.valuesLabel}</div>
          ${valores.map((v, i) => `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span style="background:#FFE600;color:#111;font-weight:800;font-size:10px;width:18px;height:18px;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;">${i+1}</span>
              <span style="font-size:13px;font-weight:${i===0?'700':'400'};color:#111;">${v}${i===0?` <span style="font-size:9px;color:#8a7000;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-left:6px;">${labels.mainTag}</span>`:''}</span>
            </div>`).join('')}
        </div>` : ''}
        ${pasion ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">${labels.passionLabel}</div>
          <div style="font-size:13px;line-height:1.6;color:#333;">${pasion}</div>
        </div>` : ''}
        ${fortalezas && fortalezas.length ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">${labels.strengthsLbl}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${fortalezas.map(f => `<span style="background:#f0f0e0;color:#111;font-size:11px;font-weight:600;padding:4px 10px;border-radius:12px;">${f}</span>`).join('')}
          </div>
        </div>` : ''}
        ${valorUnico ? `
        <div style="margin-bottom:24px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">${labels.uvLabel}</div>
          <div style="font-size:13px;line-height:1.6;color:#333;">${valorUnico}</div>
        </div>` : ''}
        <div style="background:#f8f7f2;border-radius:8px;padding:20px;margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;margin-bottom:12px;">${labels.nextSteps}</div>
          ${labels.steps.map((s,i) => `
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <span style="background:#FFE600;color:#111;font-weight:800;font-size:9px;width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i+1}</span>
            <span style="font-size:12px;color:#444;line-height:1.4;">${s}</span>
          </div>`).join('')}
        </div>
      </div>
      <div style="background:#FFE600;padding:12px 32px;display:flex;justify-content:space-between;">
        <span style="font-size:10px;font-weight:700;color:#555;">${labels.footer}</span>
        <span style="font-size:10px;color:#888;">thelab-proposito.vercel.app</span>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Lab <onboarding@resend.dev>',
        to: ['thelab.leosierra@gmail.com'],
        subject: labels.subjectToLeo,
        html: summaryHtml
      })
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Lab <onboarding@resend.dev>',
        to: [email],
        subject: labels.subjectToUser,
        html: summaryHtml
      })
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Error enviando email' });
  }
}

  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const summaryHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">

      <!-- HEADER -->
      <div style="background:#FFE600;padding:32px 32px 24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#555;margin-bottom:8px;">The Lab · Leo Sierra</div>
        <div style="font-size:28px;font-weight:900;color:#111;line-height:1;">PROPÓSITO</div>
        <div style="font-size:13px;color:#333;margin-top:4px;">Diseña una Vida Extraordinaria en 6 Pasos</div>
      </div>

      <!-- PARTICIPANT INFO -->
      <div style="background:#111;padding:20px 32px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#FFE600;margin-bottom:6px;">Participante</div>
        <div style="font-size:16px;font-weight:700;color:#fff;">${nombre}</div>
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:2px;">${email} · ${telefono}</div>
      </div>

      <div style="padding:32px;">

        <!-- MANTRA -->
        ${mantra ? `
        <div style="border:2px solid #FFE600;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a7000;margin-bottom:10px;">⚡ Propósito en Una Frase</div>
          <div style="font-size:17px;font-style:italic;font-weight:600;color:#111;line-height:1.5;">${mantra}</div>
        </div>` : ''}

        <!-- PROPÓSITO -->
        <div style="border-top:3px solid #111;border-bottom:3px solid #111;padding:20px 0;margin-bottom:24px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a7000;margin-bottom:10px;">✦ Mi Propósito de Vida</div>
          <div style="font-size:15px;font-style:italic;line-height:1.7;color:#111;">${proposito || ''}</div>
        </div>

        <!-- VALORES -->
        ${valores && valores.length ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">Mis Valores</div>
          ${valores.map((v, i) => `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span style="background:#FFE600;color:#111;font-weight:800;font-size:10px;width:18px;height:18px;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;">${i+1}</span>
              <span style="font-size:13px;font-weight:${i===0?'700':'400'};color:#111;">${v}${i===0?' <span style="font-size:9px;color:#8a7000;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-left:6px;">PRINCIPAL</span>':''}</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- PASIÓN -->
        ${pasion ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">Mi Pasión</div>
          <div style="font-size:13px;line-height:1.6;color:#333;">${pasion}</div>
        </div>` : ''}

        <!-- FORTALEZAS -->
        ${fortalezas && fortalezas.length ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">Mis Fortalezas</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${fortalezas.map(f => `<span style="background:#f0f0e0;color:#111;font-size:11px;font-weight:600;padding:4px 10px;border-radius:12px;">${f}</span>`).join('')}
          </div>
        </div>` : ''}

        <!-- VALOR ÚNICO -->
        ${valorUnico ? `
        <div style="margin-bottom:24px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;border-bottom:2px solid #FFE600;padding-bottom:6px;margin-bottom:12px;">Mi Valor Único</div>
          <div style="font-size:13px;line-height:1.6;color:#333;">${valorUnico}</div>
        </div>` : ''}

        <!-- NEXT STEPS -->
        <div style="background:#f8f7f2;border-radius:8px;padding:20px;margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a7000;margin-bottom:12px;">Próximos Pasos</div>
          ${['Mantén tu propósito visible — escríbelo donde lo veas cada día.','Identifica UNA decisión esta semana alineada con tu propósito.','Comparte tu propósito con alguien de confianza.','Trabaja con un coach para convertirlo en un plan concreto.'].map((s,i) => `
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <span style="background:#FFE600;color:#111;font-weight:800;font-size:9px;width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i+1}</span>
            <span style="font-size:12px;color:#444;line-height:1.4;">${s}</span>
          </div>`).join('')}
        </div>

      </div>

      <!-- FOOTER -->
      <div style="background:#FFE600;padding:12px 32px;display:flex;justify-content:space-between;">
        <span style="font-size:10px;font-weight:700;color:#555;">The Lab · Leo Sierra — Diseña Tu Propósito</span>
        <span style="font-size:10px;color:#888;">thelab-proposito.vercel.app</span>
      </div>

    </div>
  `;

  try {
    // Send to Leo
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Lab <onboarding@resend.dev>',
        to: ['thelab.leosierra@gmail.com'],
        subject: `Nuevo participante: ${nombre} — Diseña Tu Propósito`,
        html: summaryHtml
      })
    });

    // Send copy to participant
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The Lab <onboarding@resend.dev>',
        to: [email],
        subject: `Tu Propósito de Vida — The Lab`,
        html: summaryHtml
      })
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Error enviando email' });
  }
}
