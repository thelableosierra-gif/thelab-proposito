export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nombre, email, telefono, proposito, pasion, mantra, valores, fortalezas, valorUnico, lang } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const isEN = lang === "en";
  const valoresStr = Array.isArray(valores) ? valores.join(", ") : (valores || "");
  const fortalezasStr = Array.isArray(fortalezas) ? fortalezas.join(", ") : (fortalezas || "");

  function buildHTML(isParticipant) {
    const labelTitle = isEN ? "Life Purpose Summary" : "Resumen de Proposito de Vida";
    const labelParticipant = isEN ? "PARTICIPANT" : "PARTICIPANTE";
    const labelMantra = isEN ? "PURPOSE IN ONE SENTENCE" : "PROPOSITO EN UNA FRASE";
    const labelPurpose = isEN ? "MY LIFE PURPOSE" : "MI PROPOSITO DE VIDA";
    const labelPassion = isEN ? "MY PASSION" : "MI PASION";
    const labelValues = isEN ? "MY VALUES" : "MIS VALORES";
    const labelStrengths = isEN ? "MY STRENGTHS" : "MIS FORTALEZAS";
    const labelUnique = isEN ? "MY UNIQUE VALUE" : "MI VALOR UNICO";
    const labelCTA = isEN ? "Ready to go deeper?" : "Listo para ir mas profundo?";
    const labelCTABody = isEN
      ? "Work one-on-one with a The Lab coach to turn your purpose into concrete decisions and actions."
      : "Trabaja uno a uno con un coach de The Lab para convertir tu proposito en decisiones y acciones concretas.";
    const labelGreeting = isEN ? "Here is your life purpose summary." : "Aqui esta tu resumen de proposito de vida.";

    let html = "<div style='font-family:sans-serif;max-width:620px;margin:0 auto;color:#111'>";

    html += "<div style='background:#f5c800;padding:24px 32px'>";
    html += "<p style='margin:0;font-size:12px;letter-spacing:2px;font-weight:700'>THE LAB &middot; LEO SIERRA</p>";
    html += "<h1 style='margin:6px 0 0;font-size:22px'>" + labelTitle + "</h1>";
    html += "</div>";

    html += "<div style='background:#111;padding:16px 32px'>";
    html += "<p style='margin:0;color:#f5c800;font-size:12px;letter-spacing:1px'>" + labelParticipant + "</p>";
    html += "<p style='margin:4px 0 0;color:#fff;font-size:16px;font-weight:600'>" + nombre + "</p>";
    html += "<p style='margin:2px 0 0;color:#aaa;font-size:13px'>" + email + (telefono ? " &middot; " + telefono : "") + "</p>";
    html += "</div>";

    html += "<div style='padding:32px'>";
    html += "<p style='color:#444'>" + labelGreeting + "</p>";

    if (mantra) {
      html += "<div style='background:#f9f5e0;border-left:4px solid #f5c800;padding:20px;margin:16px 0;border-radius:4px'>";
      html += "<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700'>" + labelMantra + "</p>";
      html += "<p style='margin:0;font-size:17px;font-weight:700;line-height:1.5'>"" + mantra + ""</p>";
      html += "</div>";
    }

    if (proposito) {
      html += "<div style='margin-bottom:20px'>";
      html += "<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700'>" + labelPurpose + "</p>";
      html += "<p style='margin:0;font-size:15px;line-height:1.7;background:#f9f9f9;padding:16px;border-radius:4px'>" + proposito + "</p>";
      html += "</div>";
    }

    if (pasion) {
      html += "<div style='margin-bottom:16px'>";
      html += "<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700'>" + labelPassion + "</p>";
      html += "<p style='margin:0;font-size:14px;color:#333;line-height:1.6'>" + pasion + "</p>";
      html += "</div>";
    }

    if (valoresStr) {
      html += "<div style='margin-bottom:16px'>";
      html += "<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700'>" + labelValues + "</p>";
      html += "<p style='margin:0;font-size:14px;color:#333'>" + valoresStr + "</p>";
      html += "</div>";
    }

    if (fortalezasStr) {
      html += "<div style='margin-bottom:16px'>";
      html += "<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700'>" + labelStrengths + "</p>";
      html += "<p style='margin:0;font-size:14px;color:#333'>" + fortalezasStr + "</p>";
      html += "</div>";
    }

    if (valorUnico) {
      html += "<div style='margin-bottom:16px'>";
      html += "<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#888;font-weight:700'>" + labelUnique + "</p>";
      html += "<p style='margin:0;font-size:14px;color:#333;line-height:1.6'>" + valorUnico + "</p>";
      html += "</div>";
    }

    if (isParticipant) {
      html += "<div style='background:#111;padding:20px;border-radius:6px;margin-top:16px'>";
      html += "<p style='margin:0 0 8px;color:#f5c800;font-weight:700;font-size:15px'>" + labelCTA + "</p>";
      html += "<p style='margin:0;color:#ccc;font-size:13px;line-height:1.6'>" + labelCTABody + "</p>";
      html += "</div>";
    }

    html += "</div>";
    html += "<div style='background:#f5f5f5;padding:16px 32px;text-align:center'>";
    html += "<p style='margin:0;font-size:11px;color:#999'>The Lab &middot; Leo Sierra &middot; jointhelab.org</p>";
    html += "</div></div>";

    return html;
  }

  const FROM = "The Lab <noreply@jointhelab.org>";
  const subjectParticipant = isEN ? "Your Life Purpose - The Lab" : "Tu Proposito de Vida - The Lab";
  const subjectLab = "Nuevo participante: " + nombre + " - Disena Tu Proposito";

  try {
    const r1 = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [email], subject: subjectParticipant, html: buildHTML(true) })
    });

    if (!r1.ok) {
      const e = await r1.json();
      console.error("Participant email error:", e);
      return res.status(500).json({ error: "Error enviando email al participante", detail: e });
    }

    const r2 = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: ["thelab.leosierra@gmail.com"], subject: subjectLab, html: buildHTML(false) })
    });

    if (!r2.ok) {
      const e = await r2.json();
      console.error("Lab notification error:", e);
      return res.status(500).json({ error: "Error enviando notificacion a The Lab", detail: e });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("Send email exception:", error);
    return res.status(500).json({ error: "Error enviando email" });
  }
}
