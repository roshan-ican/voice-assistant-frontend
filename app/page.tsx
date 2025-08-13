"use client";

import NotionViewer from "components/NotionViewer";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import VoiceChat from "components/VoiceChat";
import { FileText, MessageSquare, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");
  const { theme, setTheme } = useTheme();
  const [notionUrl, setNotionUrl] = useState<string | null>(null);

  const handleNotionPageCreated = (pageUrl: string) => {
    setNotionUrl(pageUrl);
    // Auto-switch to Notion tab when a page is created
    setActiveTab("notion");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full h-screen flex flex-col">
        {/* Mobile-Optimized Header */}
        <div className="border-b border-border px-3 py-2 bg-background/95 backdrop-blur-sm sticky top-0 z-10 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                Voice-to-Notion
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Create todos with voice or text
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 h-8 w-8 sm:h-9 sm:w-9 shrink-0"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-3 w-3 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3 w-3 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        {/* Mobile-Optimized Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            {/* Mobile-Friendly Tab Navigation */}
            <div className="px-3 py-2 border-b border-border bg-background/50">
              <TabsList className="grid w-full grid-cols-2 h-9 p-1">
                <TabsTrigger
                  value="chat"
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm px-2"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Voice Chat</span>
                  <span className="xs:hidden">Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notion"
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm px-2"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Notion Pages</span>
                  <span className="xs:hidden">Pages</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area with Touch-Friendly Spacing */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full m-0 p-3 sm:p-4">
                <Card className="h-full border-0 sm:border shadow-none sm:shadow-sm">
                  <VoiceChat onNotionPageCreated={handleNotionPageCreated} />
                </Card>
              </TabsContent>

              <TabsContent value="notion" className="h-full m-0 p-3 sm:p-4">
                <Card className="h-full border-0 sm:border shadow-none sm:shadow-sm">
                  <NotionViewer notionUrl={notionUrl} />
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx global>{`
        /* Ensure proper viewport handling */
        @media (max-width: 640px) {
          .container {
            padding-left: 0 !important;
            padding-right: 0 !important;
            max-width: none !important;
          }
        }

        /* Safe area support for iOS */
        .safe-area-top {
          padding-top: max(0.5rem, env(safe-area-inset-top));
        }

        /* Touch target improvements */
        @media (max-width: 640px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }

          /* Improve tap targets for tabs */
          [role="tab"] {
            min-height: 44px;
          }
        }

        /* Prevent zoom on input focus (iOS) */
        @media (max-width: 640px) {
          input,
          textarea,
          select {
            font-size: 16px !important;
          }
        }

        /* Custom breakpoint for extra small screens */
        @media (min-width: 475px) {
          .xs\\:inline {
            display: inline !important;
          }
          .xs\\:hidden {
            display: none !important;
          }
        }

        @media (max-width: 474px) {
          .xs\\:inline {
            display: none !important;
          }
          .xs\\:hidden {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
}
