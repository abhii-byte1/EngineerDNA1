import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useListMentorSessions, useCreateMentorSession, useGetMentorSession, useSendMentorMessage, getListMentorSessionsQueryKey, getGetMentorSessionQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Plus, Send, BrainCircuit, Terminal } from "lucide-react"

const createSchema = z.object({
  topic: z.string().min(3, "Topic required"),
  firstMessage: z.string().min(5, "Initial query required")
})

const messageSchema = z.object({
  content: z.string().min(1)
})

export default function MentorPage() {
  const queryClient = useQueryClient()
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)

  const { data: sessions } = useListMentorSessions()
  
  // Set initial active session if none selected
  React.useEffect(() => {
    if (!activeSessionId && sessions && sessions.length > 0) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  const { data: activeSession, isLoading: isSessionLoading } = useGetMentorSession(activeSessionId as number, {
    query: { enabled: !!activeSessionId }
  })

  const createSession = useCreateMentorSession()
  const sendMessage = useSendMentorMessage()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { topic: "", firstMessage: "" }
  })

  const msgForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages])

  const onCreateSubmit = (values: z.infer<typeof createSchema>) => {
    createSession.mutate({ data: values }, {
      onSuccess: (newSession) => {
        queryClient.invalidateQueries({ queryKey: getListMentorSessionsQueryKey() })
        setActiveSessionId(newSession.id)
        setIsCreating(false)
        createForm.reset()
      }
    })
  }

  const onMsgSubmit = (values: z.infer<typeof messageSchema>) => {
    if (!activeSessionId) return
    
    sendMessage.mutate({ id: activeSessionId, data: { content: values.content } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMentorSessionQueryKey(activeSessionId) })
        msgForm.reset()
      }
    })
  }

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar - Sessions List */}
      <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-card/50">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <h2 className="font-bold flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-primary"/> AI Mentor</h2>
          <Button size="icon" variant="ghost" onClick={() => setIsCreating(true)}><Plus className="w-4 h-4" /></Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions?.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSessionId(s.id); setIsCreating(false); }}
              className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${activeSessionId === s.id && !isCreating ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted text-muted-foreground'}`}
            >
              <div className="font-medium truncate">{s.topic}</div>
              <div className="text-xs font-mono opacity-70 mt-1">{s.messageCount} msgs • {new Date(s.createdAt).toLocaleDateString()}</div>
            </button>
          ))}
          {sessions?.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">No sessions. Start one.</div>
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border bg-background">
        {isCreating ? (
          <div className="p-8 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Initialize Mentor Session</h2>
              <p className="text-muted-foreground mt-2">Engage with a senior AI engineer for architecture review, debugging, or career advice.</p>
            </div>
            
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <Input placeholder="Session Topic (e.g. Microservices vs Monolith)" {...createForm.register("topic")} className="font-mono" />
              </div>
              <div>
                <Input placeholder="Initial Query / Problem Statement..." {...createForm.register("firstMessage")} />
              </div>
              <Button type="submit" className="w-full" disabled={createSession.isPending}>
                {createSession.isPending ? "Connecting..." : "Open Channel"}
              </Button>
            </form>
          </div>
        ) : !activeSessionId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a session
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold">{activeSession?.topic}</h3>
                <p className="text-xs font-mono text-muted-foreground">Session ID: {activeSession?.id}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted border border-border rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Terminal className="w-3 h-3" /> System
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 bg-card shrink-0 border-t border-border">
              <form onSubmit={msgForm.handleSubmit(onMsgSubmit)} className="flex gap-2">
                <Input 
                  placeholder="Enter query..." 
                  {...msgForm.register("content")} 
                  autoComplete="off"
                  className="flex-1 bg-background border-input"
                />
                <Button type="submit" size="icon" disabled={sendMessage.isPending || !msgForm.watch("content")}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
