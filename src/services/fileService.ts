import { apiGet, apiDelete } from './api'
import type { Asset } from '@/types'

/** Asset metadata calls. Downloads use the asset's public file_url directly. */
export const fileService = {
  getAsset(id: string): Promise<Asset> {
    return apiGet<Asset>(`/files/${id}`)
  },

  deleteAsset(id: string): Promise<{ status: string }> {
    return apiDelete<{ status: string }>(`/files/${id}`)
  },
}
