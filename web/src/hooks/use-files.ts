import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface FileRecord {
  id: string;
  filename: string;
  original_name: string;
  content_type: string;
  size: number;
  s3_key: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PresignedUploadResponse {
  file: FileRecord;
  upload_url: string;
}

interface PresignedDownloadResponse {
  download_url: string;
}

export function useFiles() {
  return useQuery({
    queryKey: ["files"],
    queryFn: () => apiFetch<FileRecord[]>("/files"),
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Init upload — get presigned PUT URL
      const { file: record, upload_url } =
        await apiFetch<PresignedUploadResponse>("/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type || undefined,
            size: file.size,
          }),
        });

      // 2. Upload directly to S3 via presigned URL
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("S3 upload failed");

      // 3. Confirm upload
      const confirmed = await apiFetch<FileRecord>(
        `/files/${record.id}/confirm`,
        { method: "PATCH" },
      );
      return confirmed;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { download_url } = await apiFetch<PresignedDownloadResponse>(
        `/files/${id}`,
      );
      window.open(download_url, "_blank");
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/files/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
