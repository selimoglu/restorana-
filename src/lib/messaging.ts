/**
 * SMS ve e-posta gönderimi. Sağlayıcı anahtarları yoksa mesajlar sadece loglanır (demo modu).
 * Ticari iletiler yalnızca İYS onayı olan müşterilere gönderilmelidir; bu kontrol kampanya tarafında yapılır.
 */

export async function sendSms(phone: string, message: string): Promise<boolean> {
  const user = process.env.NETGSM_USERCODE;
  const pass = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_HEADER;
  if (!user || !pass || !header) {
    console.log(`[SMS demo] ${phone}: ${message}`);
    return true;
  }
  const res = await fetch("https://api.netgsm.com.tr/sms/rest/v2/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64"),
    },
    body: JSON.stringify({ msgheader: header, encoding: "TR", iysfilter: "11", messages: [{ msg: message, no: phone }] }),
  });
  return res.ok;
}

export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) {
    console.log(`[E-posta demo] ${to}: ${subject}\n${text}`);
    return true;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
  });
  return res.ok;
}

/** WhatsApp Business API henüz bağlı değil: mesaj loglanır. */
export async function sendWhatsapp(phone: string, message: string): Promise<boolean> {
  console.log(`[WhatsApp demo] ${phone}: ${message}`);
  return true;
}
