import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileImage,
  File,
  Download,
  Upload,
  FolderPlus,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/layout/site-header";

/* ─── Types ─── */

interface FileNode {
  id: string;
  name: string;
  type: "file";
  extension: string;
  size: string;
  uploadDate: string;
}

interface FolderNode {
  id: string;
  name: string;
  type: "folder";
  children: TreeNode[];
}

type TreeNode = FileNode | FolderNode;

/* ─── Mock Data ─── */

const PROJECT = {
  id: 1,
  title: "역삼동 단독주택 설계",
  status: "진행중" as const,
};

const mockTree: TreeNode[] = [
  {
    id: "f1",
    name: "설계 도면",
    type: "folder",
    children: [
      { id: "d1", name: "평면도.pdf", type: "file", extension: "pdf", size: "2.4 MB", uploadDate: "2026.02.15" },
      { id: "d2", name: "입면도.pdf", type: "file", extension: "pdf", size: "1.8 MB", uploadDate: "2026.02.15" },
      { id: "d3", name: "단면도.dwg", type: "file", extension: "dwg", size: "5.2 MB", uploadDate: "2026.02.18" },
    ],
  },
  {
    id: "f2",
    name: "인허가 서류",
    type: "folder",
    children: [
      { id: "d4", name: "건축허가서.pdf", type: "file", extension: "pdf", size: "0.8 MB", uploadDate: "2026.01.20" },
    ],
  },
  {
    id: "f3",
    name: "시공 사진",
    type: "folder",
    children: [
      { id: "d5", name: "착공사진1.jpg", type: "file", extension: "jpg", size: "3.1 MB", uploadDate: "2026.03.01" },
      { id: "d6", name: "착공사진2.jpg", type: "file", extension: "jpg", size: "2.9 MB", uploadDate: "2026.03.01" },
    ],
  },
];

/* ─── Helpers ─── */

function getFileIcon(extension: string) {
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const docExts = ["pdf", "doc", "docx", "txt"];

  if (imageExts.includes(extension.toLowerCase())) {
    return <FileImage className="size-4 text-blue-500 shrink-0" />;
  }
  if (docExts.includes(extension.toLowerCase())) {
    return <FileText className="size-4 text-red-500 shrink-0" />;
  }
  return <File className="size-4 text-muted-foreground shrink-0" />;
}

/* ─── Tree Node Component ─── */

function TreeNodeItem({
  node,
  expandedFolders,
  onToggleFolder,
  selectedFileId,
  onSelectFile,
  depth = 0,
}: {
  node: TreeNode;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  selectedFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  depth?: number;
}) {
  if (node.type === "folder") {
    const isExpanded = expandedFolders.has(node.id);
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.id)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="size-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="size-4 text-amber-500 shrink-0" />
          )}
          <span className="font-medium truncate">{node.name}</span>
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {node.children.length}
          </span>
        </button>
        {isExpanded && (
          <div>
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFileId === node.id;
  return (
    <button
      onClick={() => onSelectFile(node)}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
      }`}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      {getFileIcon(node.extension)}
      <span className="truncate">{node.name}</span>
      <span className="ml-auto text-xs text-muted-foreground shrink-0">
        {node.size}
      </span>
    </button>
  );
}

/* ─── Page ─── */

export default function ProjectDeliverablesPage() {
  const { id } = useParams();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["f1"])
  );
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const isEmpty = mockTree.length === 0;

  function handleToggleFolder(folderId: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  function handleSelectFile(file: FileNode) {
    setSelectedFile(file);
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-[1120px] px-6">
        {/* Breadcrumb */}
        <div className="pt-6 pb-6">
          <Link
            to={`/projects/${id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            {PROJECT.title}
          </Link>
        </div>

        {/* Title bar */}
        <div className="flex items-center gap-3 pb-6">
          <h1 className="text-[26px] font-semibold tracking-tight">
            산출물 관리
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              PROJECT.status === "진행중"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                PROJECT.status === "진행중"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            {PROJECT.status}
          </span>
        </div>

        <Separator className="mb-6" />

        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24">
            <PackageOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              아직 등록된 산출물이 없습니다
            </p>
            <Button className="mt-4">
              <Upload className="size-4 mr-2" />
              파일 업로드
            </Button>
          </div>
        ) : (
          /* 2-panel layout */
          <div className="flex gap-6 pb-16">
            {/* Left: File tree */}
            <div className="w-[320px] shrink-0">
              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="sm" className="rounded-xl h-9">
                  <FolderPlus className="size-4 mr-1.5" />
                  폴더
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl h-9">
                  <Upload className="size-4 mr-1.5" />
                  업로드
                </Button>
              </div>

              {/* Tree */}
              <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm p-3">
                <div className="space-y-0.5">
                  {mockTree.map((node) => (
                    <TreeNodeItem
                      key={node.id}
                      node={node}
                      expandedFolders={expandedFolders}
                      onToggleFolder={handleToggleFolder}
                      selectedFileId={selectedFile?.id ?? null}
                      onSelectFile={handleSelectFile}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Preview panel */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl bg-card ring-1 ring-black/[0.08] shadow-sm min-h-[400px]">
                {selectedFile ? (
                  <div className="p-6">
                    {/* File info header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(selectedFile.extension)}
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold truncate">
                            {selectedFile.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedFile.size} · {selectedFile.uploadDate} 업로드
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="rounded-xl h-9 shrink-0">
                        <Download className="size-4 mr-1.5" />
                        다운로드
                      </Button>
                    </div>

                    <Separator className="my-5" />

                    {/* Preview area */}
                    <div className="flex items-center justify-center rounded-xl bg-muted/50 py-20">
                      <div className="text-center">
                        {getFileIcon(selectedFile.extension)}
                        <p className="mt-3 text-sm text-muted-foreground">
                          미리보기를 지원하지 않는 파일 형식입니다
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          다운로드하여 확인해주세요
                        </p>
                      </div>
                    </div>

                    {/* File details */}
                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">파일명</p>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">크기</p>
                        <p className="text-sm font-medium">{selectedFile.size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">형식</p>
                        <p className="text-sm font-medium uppercase">{selectedFile.extension}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">업로드일</p>
                        <p className="text-sm font-medium">{selectedFile.uploadDate}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty preview state */
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <FileText className="size-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      파일을 선택하면 미리보기가 표시됩니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
