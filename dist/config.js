// Authority Gap Quiz — routing and endpoint config.
// Edit these values only. Nothing else in the app should hardcode a URL.

window.QUIZ_CONFIG = {
  // Verified live Challenge page. Never route anywhere else and never
  // imply the visitor registered — this only links to the invitation.
  challengeUrl: "https://nextlevel.tieshagreen.com/",

  // Secondary fallback option, used only inside the result-email copy
  // (sent from GHL), never as the on-page primary CTA.
  auditUrl: "https://api.leadconnectorhq.com/widget/booking/jPpv5PNYXvldZFgXaOMj",

  privacyUrl: "https://tieshagreen.com/privacy.html",

  // GHL Inbound Webhook for the "Authority Gap Quiz — Capture, Tag & Result Email"
  // workflow. Receives { email, profile, highestTotal, isTie, source }.
  webhookUrl: "https://services.leadconnectorhq.com/hooks/5zEv2FFMjyeAsbyYv5KE/webhook-trigger/72e57d3e-73ec-470d-a399-6189010bda70"
};
