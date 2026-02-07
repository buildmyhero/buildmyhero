import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [pollCount, setPollCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(portraitUrl);

  // Poll for portrait if it's still being generated
  useEffect(() => {
    if (!portraitUrl && pollCount < 30) {
      const timer = setTimeout(async () => {
        try {
          // Check if portrait is now available by fetching the character
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/characters?id=eq.${characterId}&select=portrait_url`,
            {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              }
            }
          );
          const data = await response.json();
          if (data?.[0]?.portrait_url) {
            setCurrentUrl(data[0].portrait_url);
          } else {
            setPollCount(prev => prev + 1);
          }
        } catch (error) {
          console.error('Failed to poll for portrait:', error);
          setPollCount(prev => prev + 1);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearTimeout(timer);
    }
  }, [portraitUrl, characterId, pollCount]);

  // Update current URL when prop changes
  useEffect(() => {
    if (portraitUrl) {
      setCurrentUrl(portraitUrl);
    }
  }, [portraitUrl]);

  const showLoading = isGenerating || (!currentUrl && pollCount < 30);
  const showPlaceholder = !currentUrl && pollCount >= 30;

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

  if (showPlaceholder || imageError) {
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
