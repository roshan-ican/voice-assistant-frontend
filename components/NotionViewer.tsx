"use client";

import React, { useState } from "react";

import { ExternalLink, RefreshCw, Globe } from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface NotionViewerProps {
  notionUrl?: string | null;
}

export default function NotionViewer({ notionUrl }: NotionViewerProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState(notionUrl || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadUrl = () => {
    if (customUrl.trim()) {
      setCurrentUrl(customUrl.trim());
      setIsLoading(true);
      // Simulate loading time
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const openInNewTab = () => {
    if (currentUrl) {
      window.open(currentUrl, "_blank");
    }
  };

  React.useEffect(() => {
    if (notionUrl) {
      setCurrentUrl(notionUrl);
    }
  }, [notionUrl]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Notion Pages
            </h2>
            <p className="text-sm text-muted-foreground">
              View your created todo lists in Notion
            </p>
          </div>
          <div className="flex gap-2">
            {currentUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="sm" onClick={openInNewTab}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter Notion page URL or use auto-generated links from chat..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLoadUrl()}
            className="flex-1"
          />
          <Button onClick={handleLoadUrl} disabled={!customUrl.trim()}>
            Load
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {currentUrl ? (
          <div className="h-full relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading Notion page...
                  </span>
                </div>
              </div>
            )}
            <iframe
              src={currentUrl}
              className="w-full h-full border-0 rounded-lg"
              title="Notion Page"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Notion page loaded
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a todo list in the Voice Chat tab, or enter a Notion page
                URL above to view your pages.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  • Todo lists created via voice/text will appear here
                  automatically
                </p>
                <p>• You can also manually enter any Notion page URL</p>
                <p>• Use the refresh button to reload the current page</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
