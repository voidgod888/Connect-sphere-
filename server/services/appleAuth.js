import { createRemoteJWKSet, jwtVerify } from 'jose';

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_JWKS_URL = new URL(`${APPLE_ISSUER}/auth/keys`);

const appleClientIds = (process.env.APPLE_CLIENT_IDS || process.env.APPLE_CLIENT_ID || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

if (appleClientIds.length === 0) {
  console.warn('⚠️  APPLE_CLIENT_ID(S) is not configured. Apple Sign-In requests will fail.');
}

const jwks = createRemoteJWKSet(APPLE_JWKS_URL);

export async function verifyAppleIdentityToken(identityToken) {
  if (!identityToken) {
    throw new Error('Identity token is required');
  }

  const { payload } = await jwtVerify(identityToken, jwks, {
    issuer: APPLE_ISSUER,
    audience: appleClientIds.length > 0 ? appleClientIds : undefined,
  });

  return payload;
}

