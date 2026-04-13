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

function signPayload(email, otp, exp, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${email}|${otp}|${exp}`)
    .digest("hex");
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a), "utf8");
  const bb = Buffer.from(String(b), "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function parseChallenge(token) {
  try {
    const decoded = Buffer.from(String(token || ""), "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 4) return null;
    return {
      email: parts[0],
      exp: Number(parts[1]),
      otp: parts[2],
      sig: parts[3],
    };
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const signingSecret = process.env.OTP_SIGNING_SECRET;
  if (!signingSecret) {
    return json(res, 500, { ok: false, error: "missing_server_env" });
  }

  const email = normalizeEmail(req.body && req.body.email);
  const code = String((req.body && req.body.code) || "").trim();
  const challengeToken = String((req.body && req.body.challengeToken) || "");
  if (!email || !/^\d{6}$/.test(code) || !challengeToken) {
    return json(res, 400, { ok: false, error: "invalid_payload" });
  }

  const challenge = parseChallenge(challengeToken);
  if (!challenge) {
    return json(res, 400, { ok: false, error: "invalid_challenge" });
  }

  if (Date.now() > challenge.exp) {
    return json(res, 200, { ok: false, error: "expired" });
  }

  if (email !== normalizeEmail(challenge.email)) {
    return json(res, 200, { ok: false, error: "email_mismatch" });
  }

  const expectedSig = signPayload(
    normalizeEmail(challenge.email),
    challenge.otp,
    challenge.exp,
    signingSecret
  );
  if (!safeEqual(expectedSig, challenge.sig)) {
    return json(res, 200, { ok: false, error: "bad_signature" });
  }

  return json(res, 200, { ok: safeEqual(challenge.otp, code) });
};
