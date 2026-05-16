import { apiGet, apiPost, apiDelete } from './api'
import type { Asset } from '@/types'

/** Asset upload + metadata calls. Downloads use the public file_url directly. */
export const fileService = {
  /**
   * Uploads a file and returns its asset record. The asset is linked to a
   * conversation later, through the run that references it by id.
   */
  upload(file: File): Promise<Asset> {
    const form = new FormData()
    form.append('file', file)
    return apiPost<Asset>('/files/upload', form)
  },

  getAsset(id: string): Promise<Asset> {
    return apiGet<Asset>(`/files/${id}`)
  },

  deleteAsset(id: string): Promise<{ status: string }> {
    return apiDelete<{ status: string }>(`/files/${id}`)
  },
}
