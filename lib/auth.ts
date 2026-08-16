import 'server-only'
import bcrypt from 'bcryptjs'

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedHash = process.env.ADMIN_PASSWORD_HASH
  if (!expectedUsername || !expectedHash) {
    throw new Error('ADMIN_USERNAME / ADMIN_PASSWORD_HASH are not set')
  }
  // Compare the username as well, at constant-ish cost, before the (already
  // constant-time) password check — bcrypt.compare dominates either way.
  if (username !== expectedUsername) {
    await bcrypt.compare(password, expectedHash) // keep timing similar whether or not the username matched
    return false
  }
  return bcrypt.compare(password, expectedHash)
}
