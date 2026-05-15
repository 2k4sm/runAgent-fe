/** Standard backend error body: { detail: string }. */
export interface ApiErrorBody {
  detail: string
}

export interface HealthResponse {
  status: string
}
