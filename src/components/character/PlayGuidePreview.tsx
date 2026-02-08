import ReactMarkdown from 'react-markdown';

interface PlayGuidePreviewProps {
  content: string;
}

export function PlayGuidePreview({ content }: PlayGuidePreviewProps) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="text-lg font-display font-bold text-gold mt-6 mb-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-primary mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-4">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-gold mt-1">•</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
