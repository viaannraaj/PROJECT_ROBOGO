/**
 * Production: set requestOtpUrl / verifyOtpUrl to your backend that sends email OTP
 * and verifies codes server-side. Do not store OTPs only in the browser in production.
 *
 * Example:
 *   requestOtpUrl: "https://api.yourdomain.com/waitlist/request-otp"
 *   verifyOtpUrl: "https://api.yourdomain.com/waitlist/verify-otp"
 */
window.RoblogNextWaitlistConfig = {
  requestOtpUrl: "/api/waitlist/request-otp",
  verifyOtpUrl: "/api/waitlist/verify-otp",
  /** Demo only: show the code on-screen when email is not wired up */
  demoRevealOtp: false,
};
