import { env } from "cloudflare:workers";

const STATUS_COPY: Record<string, string> = {
  Nuevo: "Tu solicitud fue registrada.",
  "En análisis": "Un analista está revisando tu solicitud.",
  "En progreso": "Tu solicitud está en curso.",
  Bloqueado: "Tu solicitud quedó bloqueada temporalmente.",
  Resuelto: "¡Tu solicitud fue resuelta!",
};

type MailgunEnv = {
  MAILGUN_API_KEY?: string;
  MAILGUN_DOMAIN?: string;
  MAILGUN_BASE_URL?: string;
};

export async function sendStatusEmail({
  to,
  requesterName,
  requestId,
  requestTitle,
  status,
}: {
  to: string | null | undefined;
  requesterName: string;
  requestId: string;
  requestTitle: string;
  status: string;
}) {
  if (!to) return;

  const { MAILGUN_API_KEY: apiKey, MAILGUN_DOMAIN: domain, MAILGUN_BASE_URL: baseUrl } =
    env as MailgunEnv;

  if (!apiKey || !domain) {
    console.warn("MAILGUN_API_KEY/MAILGUN_DOMAIN no configuradas, se omite el envío de email.");
    return;
  }

  const intro = STATUS_COPY[status] ?? "El estado de tu solicitud cambió.";
  const html = `
    <div style="font-family: sans-serif; color: #12151a; max-width: 480px;">
      <p>Hola ${requesterName},</p>
      <p>${intro}</p>
      <p style="padding: 12px 16px; background: #f5f6f7; border-radius: 8px;">
        <strong>${requestId}</strong> · ${requestTitle}<br />
        Nuevo estado: <strong>${status}</strong>
      </p>
      <p style="color: #666e78; font-size: 13px;">
        Este correo lo envía OpsFlow, una demo de portfolio.
      </p>
    </div>
  `;

  const body = new URLSearchParams({
    from: `OpsFlow <notificaciones@${domain}>`,
    to,
    subject: `${requestId} actualizada a "${status}"`,
    html,
  });

  try {
    const response = await fetch(
      `${baseUrl ?? "https://api.mailgun.net"}/v3/${domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!response.ok) {
      console.error("Mailgun respondió con error", response.status, await response.text());
    }
  } catch (error) {
    console.error("email de estado no se pudo enviar", error);
  }
}
