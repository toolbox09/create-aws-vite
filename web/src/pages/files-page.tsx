import { useRef } from "react";
import {
  useFiles,
  useUploadFile,
  useDownloadFile,
  useDeleteFile,
} from "@/hooks/use-files";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { data: files, isLoading, error } = useFiles();
  const uploadFile = useUploadFile();
  const downloadFile = useDownloadFile();
  const deleteFile = useDeleteFile();
  const inputRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error.message}
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Files</h1>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadFile.mutate(file);
              e.target.value = "";
            }
          }}
          disabled={uploadFile.isPending}
          className="flex-1 text-sm file:mr-3 file:px-4 file:py-2 file:border file:rounded-md file:bg-transparent file:cursor-pointer hover:file:bg-neutral-100 dark:hover:file:bg-neutral-800"
        />
        {uploadFile.isPending && (
          <span className="self-center text-sm text-neutral-500">
            Uploading...
          </span>
        )}
      </div>
      {uploadFile.isError && (
        <p className="text-sm text-red-500">
          Upload failed: {uploadFile.error.message}
        </p>
      )}

      <div className="space-y-2">
        {files?.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{file.original_name}</p>
              <p className="text-sm text-neutral-500">
                {file.content_type} &middot; {formatSize(file.size)} &middot;{" "}
                {new Date(file.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => downloadFile.mutate(file.id)}
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Download
              </button>
              <button
                onClick={() => deleteFile.mutate(file.id)}
                className="px-3 py-1.5 text-sm border rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {files?.length === 0 && (
          <p className="text-center text-neutral-500 py-8">
            No files uploaded yet
          </p>
        )}
      </div>
    </div>
  );
}
