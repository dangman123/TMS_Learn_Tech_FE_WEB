export interface DocumentModel {
    documentId: number;
    documentTitle: string;
    image_url: string;
    url: string;
    view: number;
    created_at: string; // Assuming created_at is in ISO string format
    download_count: number;
    id_category : number;
    name: string;
  }

