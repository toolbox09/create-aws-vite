import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const IFRAME_TIMEOUT_MS = 30_000;
const DEFAULT_VIEWER_URL = "https://my.matterport.com/show/?m=demo";

export default function Ai3dViewerPage() {
  const [searchParams] = useSearchParams();

  const reportId = searchParams.get("reportId") ?? "";
  const purpose = searchParams.get("purpose") ?? "";
  const viewerUrl = searchParams.get("viewerUrl") || DEFAULT_VIEWER_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryKey((k) => k + 1);
  }, []);

  /* ─── Timeout ─── */

  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, IFRAME_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="bg-background min-h-svh flex flex-col">
      {/* ─── Header ─── */}
      <header className="bg-card shadow-xs flex h-12 items-center gap-3 px-4">
        <Link
          to={`/analysis/reports/${reportId}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>리포트로 돌아가기</span>
        </Link>

        <span className="text-sm font-semibold">리포트 #{reportId}</span>

        {purpose && (
          <Badge variant="secondary" className="text-xs font-medium">
            {purpose}
          </Badge>
        )}
      </header>

      {/* ─── Content ─── */}
      <div className="relative h-[calc(100svh-48px)]">
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
            <AlertCircle className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              3D 뷰어를 불러오지 못했습니다.
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          </div>
        )}

        {/* iframe */}
        {!hasError && (
          <iframe
            key={retryKey}
            src={viewerUrl}
            className="h-full w-full border-0"
            allow="fullscreen"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
}
