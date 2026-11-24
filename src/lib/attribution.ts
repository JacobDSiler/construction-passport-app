// Required on every shared or exported passport and timesheet, on every plan (see docs/MONETIZATION.md).
export const ATTRIBUTION_LINE = 'Provided by Construction Passport (Prime Management 18)';
export const CTA_LINE = 'Get the Construction Passport app';
export const WEB_URL = 'https://construction-passport-web.netlify.app';
// TODO: replace with the live store listing URLs once the apps are published.
export const PLAY_STORE_URL = '';
export const APP_STORE_URL = '';

/** Plain-text footer for share sheets, CSV headers and printed pages. */
export function attributionFooter(): string {
  const links = [PLAY_STORE_URL, APP_STORE_URL, WEB_URL].filter(Boolean).join('\n');
  return `${ATTRIBUTION_LINE}\n${CTA_LINE}\n${links}`;
}

/** HTML footer for expo-print PDFs. */
export function attributionHtml(): string {
  const links = [PLAY_STORE_URL, APP_STORE_URL, WEB_URL]
    .filter(Boolean)
    .map((u) => `<a href="${u}">${u}</a>`)
    .join(' &middot; ');
  return `<div style="margin-top:24px;padding-top:8px;border-top:1px solid #ccc;font-size:11px;color:#555">
<strong>${ATTRIBUTION_LINE}</strong><br/>${CTA_LINE}: ${links}</div>`;
}
