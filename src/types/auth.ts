/** Shape returned by GET /api/v1/auth/me. */
export interface CurrentUser {
  id: string
  email: string | null
  role: string | null
}
