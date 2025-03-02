import axios from 'axios';
import { File as FileType } from '../types/file';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fileService = {
  async uploadFile(file: File): Promise<FileType> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

async getFiles(filters: Record<string, string | number | undefined> = {}): Promise<FileType[]> {
  try {
    const query = new URLSearchParams(
      Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .reduce((acc, [key, value]) => {
        if (key === 'max_size' || key === 'min_size') {
        value = Number(value) * 1024;
        }
        return { ...acc, [key]: String(value) };
      }, {})
    ).toString();

    const response = await axios.get(`${API_URL}/files/${query ? `?${query}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw new Error('Failed to fetch files');
  }
},

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },
  
  async getStorageSavings(): Promise<{ total_savings: number; total_deduplicated_files: number }> {
    try {
      const response = await axios.get(`${API_URL}/storage-savings/total_savings/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching storage savings:", error);
      return { total_savings: 0, total_deduplicated_files: 0 }; // Default values on failure
    }
  },
}; 