import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PortraitWithSkeletonProps {
  portraitUrl: string | null;
  characterName: string;
  characterId: string;
  className?: string;
  isGenerating?: boolean;
  onRetryGeneration?: () => void;
}

export function PortraitWithSkeleton({ 
  portraitUrl, 
  characterName, 
  characterId,
  className = "",
  isGenerating = false,
  onRetryGeneration
}: PortraitWithSkeletonProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  // Start with whatever url we already have (may already be populated)
  const [currentUrl, setCurrentUrl] = useState(portraitUrl);
  const [gaveUp, setGaveUp] = useState(false);
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When the prop changes (parent re-renders with a new URL), adopt it immediately
  useEffect(() => {
    if (portraitUrl && portraitUrl !== currentUrl) {
      setCurrentUrl(portraitUrl);
    }
  }, [portraitUrl]);

  // Poll Supabase directly for portrait_url while it's null
  // Uses the supabase client (already configured) instead of raw fetch
  // to avoid env var issues. Polls up to 60 times (3 min) before giving up.
  useEffect(() => {
    if (currentUrl) return; // Already have it — nothing to do
    if (gaveUp) return;
    if (!characterId) return;

    let cancelled = false;
    pollCountRef.current = 0;

    const poll = async () => {
      if (cancelled) return;
      if (pollCountRef.current >= 60) {
        setGaveUp(true);
        return;
      }

      pollCountRef.current += 1;

      try {
        const { data } = await supabase
          .from('characters')
          .select('portrait_url')
          .eq('id', characterId)
          .single();

        if (data?.portrait_url) {
          if (!cancelled) setCurrentUrl(data.portrait_url);
          return; // Stop polling
        }
      } catch (err) {
        console.error('Portrait poll error:', err);
      }

      // Schedule next poll in 3 seconds
      if (!cancelled) {
        timerRef.current = setTimeout(poll, 3000);
      }
    };

    // Start first poll after a short delay so the edge function
    // has time to begin uploading
    timerRef.current = setTimeout(poll, 2000);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [characterId, currentUrl, gaveUp]);

  const showLoading = isGenerating || (!currentUrl && !gaveUp);

  if (showLoading) {
    return (
      <div className={`relative ${className}`}>
        <Skeleton className="w-full h-full rounded-xl" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Generating portrait...
          </p>
        </div>
      </div>
    );
  }

  if (gaveUp || imageError) {
    return (
      <div className={`relative bg-gradient-card flex flex-col items-center justify-center ${className}`}>
        <User className="h-20 w-20 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground mb-4">Portrait unavailable</p>
        {onRetryGeneration && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetryGeneration}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Generation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && <Skeleton className="absolute inset-0 rounded-xl" />}
      <img
        src={currentUrl || ''}
        alt={characterName}
        className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}
