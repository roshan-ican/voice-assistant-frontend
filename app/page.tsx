'use client'

import NotionViewer from 'components/NotionViewer'
import { Button } from 'components/ui/button'
import { Card } from 'components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs'
import VoiceChat from 'components/VoiceChat'
import { FileText, MessageSquare, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'



export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const { theme, setTheme } = useTheme()
  const [notionUrl, setNotionUrl] = useState<string | null>(null)

  const handleNotionPageCreated = (pageUrl: string) => {
    setNotionUrl(pageUrl)
    // Auto-switch to Notion tab when a page is created
    setActiveTab('notion')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Voice-to-Notion</h1>
              <p className="text-sm text-muted-foreground">Create and manage your todos with voice or text</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Voice Chat
              </TabsTrigger>
              <TabsTrigger value="notion" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notion Pages
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1">
              <TabsContent value="chat" className="h-full m-0">
                <Card className="h-full">
                  <VoiceChat onNotionPageCreated={handleNotionPageCreated} />
                </Card>
              </TabsContent>
              
              <TabsContent value="notion" className="h-full m-0">
                <Card className="h-full">
                  <NotionViewer notionUrl={notionUrl} />
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}