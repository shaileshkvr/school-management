import crypto from 'crypto';

export const generateSecureInviteCode = (length = 16) => {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
};
