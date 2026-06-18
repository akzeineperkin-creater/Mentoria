export const ADMIN_EMAILS = ["akzeineperkin@gmail.com"];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === normalized);
}
