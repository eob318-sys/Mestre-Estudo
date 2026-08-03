/** Envio de e-mail transacional — usa Resend quando RESEND_API_KEY está configurada.
 *  Sem chave, retorna modo "dev" (o app exibe o conteúdo na tela em vez de enviar). */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; mode: "resend" | "dev" }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, mode: "dev" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Mestre do Estudo <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    console.error("Resend falhou:", res.status, await res.text().catch(() => ""));
    return { sent: false, mode: "dev" };
  }
  return { sent: true, mode: "resend" };
}