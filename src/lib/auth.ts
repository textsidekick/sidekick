import crypto from 'crypto';

export function generatePassword(): string {
  return crypto.randomBytes(8).toString('hex').slice(0, 12);
}

export function generateUsername(): string {
  return 'manager_' + crypto.randomBytes(6).toString('hex');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
