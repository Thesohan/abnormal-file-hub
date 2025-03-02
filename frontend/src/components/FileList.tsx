import React, { useState } from 'react';
import { fileService } from '../services/fileService';
import { File as FileType } from '../types/file';
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const FileList: React.FC = () => {
  const queryClient = useQueryClient();

  // State for applied filters (used in the query)
  const [filters, setFilters] = useState({
    upload_date: '',
    max_size: '',
    min_size: '',
    file_type: '',
    search: '',
  });

  // Temporary filters that update on user input
  const [tempFilters, setTempFilters] = useState(filters);

  // Query for fetching files with applied filters
  const { data: files, isLoading, error } = useQuery({
    queryKey: ['files', filters], // Only changes when `filters` updates
    queryFn: () => fileService.getFiles(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: ({ fileUrl, filename }: { fileUrl: string; filename: string }) =>
      fileService.downloadFile(fileUrl, filename),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      await downloadMutation.mutateAsync({ fileUrl, filename });
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters); // Apply filters only on button click
  };

  if (isLoading) {
    return <div className="p-6 text-gray-600">Loading files...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed to load files.</div>;
  }

  const FileTypeOptions = [
    { label: "PNG", value: "image/png" },
    { label: "JPEG", value: "image/jpeg" },
    { label: "GIF", value: "image/gif" },
    { label: "PDF", value: "application/pdf" },
    { label: "TXT", value: "text/plain" },
    { label: "CSV", value: "text/csv" },
    { label: "BMP", value: "image/bmp" },
    { label: "TIFF", value: "image/tiff" },
    { label: "WEBP", value: "image/webp" },
    { label: "MP3", value: "audio/mpeg" },
    { label: "OGG", value: "audio/ogg" },
    { label: "WAV", value: "audio/wav" },
    { label: "MP4", value: "video/mp4" },
    { label: "AVI", value: "video/x-msvideo" },
    { label: "WEBM", value: "video/webm" },
    { label: "ZIP", value: "application/zip" },
    { label: "GZ", value: "application/gzip" },
    { label: "JSON", value: "application/json" },
    { label: "XML", value: "application/xml" },
    { label: "DOC", value: "application/msword" },
    { label: "XLS", value: "application/vnd.ms-excel" },
    { label: "PPT", value: "application/vnd.ms-powerpoint" },
    { label: "DOCX", value: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { label: "XLSX", value: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { label: "PPTX", value: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Files</h2>

      {/* Filters Section */}
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="date"
            name="upload_date"
            value={tempFilters.upload_date}
            onChange={handleFilterChange}
            className="border rounded p-2 w-full"
          />
          <input
            type="number"
            name="min_size"
            value={tempFilters.min_size}
            onChange={handleFilterChange}
            className="border rounded p-2 w-full"
            placeholder="Min Size (KB)"
          />
          <input
            type="number"
            name="max_size"
            value={tempFilters.max_size}
            onChange={handleFilterChange}
            className="border rounded p-2 w-full"
            placeholder="Max Size (KB)"
          />
          <select
            name="file_type"
            value={tempFilters.file_type}
            onChange={handleFilterChange}
            className="border rounded p-2 w-full"
          >
            <option value="">All Types</option>
            {FileTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            value={tempFilters.search}
            onChange={handleFilterChange}
            className="border rounded p-2 w-full"
            placeholder="Search by filename"
          />
        </div>
        <button
          onClick={handleApplyFilters}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>
      </div>

      {/* File List */}
      {!files || files.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
        </div>
      ) : (
        <ul className="-my-5 divide-y divide-gray-200">
          {files.map((file) => (
            <li key={file.id} className="py-4 flex items-center space-x-4">
              <DocumentIcon className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{file.original_filename}</p>
                <p className="text-sm text-gray-500">
                  {file.file_type} • {(file.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded {new Date(file.uploaded_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDownload(file.file, file.original_filename)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
