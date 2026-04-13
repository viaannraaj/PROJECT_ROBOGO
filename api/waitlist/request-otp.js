const crypto = require("crypto");

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

function normalizeEmail(v) {
  return String(v || "")
    .trim()
    .toLowerCase();
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signPayload(email, otp, exp, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${email}|${otp}|${exp}`)
    .digest("hex");
}

function makeChallenge(email, otp, exp, secret) {
  const sig = signPayload(email, otp, exp, secret);
  return Buffer.from(`${email}|${exp}|${otp}|${sig}`, "utf8").toString("base64url");
}

async function sendOtpEmail({ to, otp, from, apiKey }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your RoblogNext verification code",
      html: `<p>Your verification code is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`email failed: ${text}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const otpFromEmail = process.env.OTP_FROM_EMAIL;
  const signingSecret = process.env.OTP_SIGNING_SECRET;
  if (!resendApiKey || !otpFromEmail || !signingSecret) {
    return json(res, 500, { ok: false, error: "missing_server_env" });
  }

  const email = normalizeEmail(req.body && req.body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: "invalid_email" });
  }

  try {
    const otp = generateOtp();
    const exp = Date.now() + 10 * 60 * 1000;
    const challengeToken = makeChallenge(email, otp, exp, signingSecret);
    await sendOtpEmail({
      to: email,
      otp,
      from: otpFromEmail,
      apiKey: resendApiKey,
    });
    return json(res, 200, { ok: true, challengeToken, expires: exp });
  } catch (error) {
    return json(res, 500, { ok: false, error: "email_send_failed" });
  }
};
