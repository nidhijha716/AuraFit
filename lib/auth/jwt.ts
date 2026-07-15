import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "aurafit_token";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function getExpiresInSeconds(): number {
  const raw = process.env.JWT_EXPIRES_IN ?? "7d";
  if (raw.endsWith("d")) return parseInt(raw, 10) * 24 * 60 * 60;
  if (raw.endsWith("h")) return parseInt(raw, 10) * 60 * 60;
  return parseInt(raw, 10) || 7 * 24 * 60 * 60;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${getExpiresInSeconds()}s`)
    .sign(getSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const email = payload.email;
    if (!sub || typeof sub !== "string" || typeof email !== "string") {
      return null;
    }
    return { sub, email };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, getExpiresInSeconds };
