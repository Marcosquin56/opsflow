import { env } from "cloudflare:workers";

const STATUS_COPY: Record<string, string> = {
  Nuevo: "Tu solicitud fue registrada.",
  "En análisis": "Un analista está revisando tu solicitud.",
  "En progreso": "Tu solicitud está en curso.",
  Bloqueado: "Tu solicitud quedó bloqueada temporalmente.",
  Resuelto: "¡Tu solicitud fue resuelta!",
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

  const apiKey = (env as { RESEND_API_KEY?: string }).RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY no configurada, se omite el envío de email.");
    return;
  }

  const intro = STATUS_COPY[status] ?? "El estado de tu solicitud cambió.";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OpsFlow <notificaciones@marcosquintana.dev>",
        to: [to],
        subject: `${requestId} actualizada a "${status}"`,
        html: `
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
        `,
      }),
    });

    if (!response.ok) {
      console.error("Resend respondió con error", response.status, await response.text());
    }
  } catch (error) {
    console.error("email de estado no se pudo enviar", error);
  }
}
