export interface DocumentModel {
  documentId: number;
  documentTitle: string;
  image_url?: string;
  url?: string;
  fileUrl?: string;
  view: number;
  created_at: string; // Định dạng ISO
  createdAt?: string;
  download_count: number;
  downloads?: number;
  id_category: number;
  categoryId?: number;
  name?: string;
  categoryName?: string;
  format?: string;
  size?: string;
  status?: string;
  description?: string;
}
