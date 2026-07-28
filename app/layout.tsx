import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "OpsFlow | Gestión inteligente de solicitudes";
const description =
  "Demo interactiva de un espacio de trabajo para gestionar solicitudes, prioridades, responsables y niveles de servicio.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return {
    title,
    description,
    applicationName: "OpsFlow",
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_PY",
      images: [
        {
          url: `${protocol}://${host}/og.png`,
          width: 1731,
          height: 909,
          alt: "OpsFlow — Gestión inteligente de solicitudes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${protocol}://${host}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
