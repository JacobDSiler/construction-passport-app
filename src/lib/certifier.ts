import { getItem, removeItem, setItem } from './storage';
import { rpc, rows } from './api';

// A certifier signs in with a code (certifier_login). The code is a credential, so it is kept in the keychain.
const CODE_KEY = 'cp.certifierCode.v1';

export const getCertifierCode = () => getItem(CODE_KEY);
export const clearCertifierCode = () => removeItem(CODE_KEY);

/** Contract: certifier_login(p_code). The return shape is not documented; a null, false or empty result is treated as refused. */
export async function certifierLogin(code: string): Promise<void> {
  const c = code.trim();
  const r = await rpc<unknown>('certifier_login', { p_code: c });
  if (r === null || r === undefined || r === false || r === '' || (Array.isArray(r) && r.length === 0)) {
    throw new Error('That certifier code was not recognised.');
  }
  await setItem(CODE_KEY, c);
}

/** Contract: list_review_passports(p_code). Row fields are read defensively. */
export async function listReviewPassports(code: string) {
  return rows(await rpc<unknown>('list_review_passports', { p_code: code }));
}
/** Contract: certify_passport(p_code, p_short_code). */
export const certifyPassport = (code: string, shortCode: string) =>
  rpc('certify_passport', { p_code: code, p_short_code: shortCode.trim().toUpperCase() });
/** Contract: revoke_certification(p_code, p_short_code). */
export const revokeCertification = (code: string, shortCode: string) =>
  rpc('revoke_certification', { p_code: code, p_short_code: shortCode.trim().toUpperCase() });
