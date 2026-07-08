import * as React from "react"
import { useGetMe } from "@workspace/api-client-react"
import { useLocation } from "wouter"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: me, isError, isLoading } = useGetMe()
  const [, setLocation] = useLocation()

  React.useEffect(() => {
    if (isError) {
      setLocation("/login")
    }
  }, [isError, setLocation])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-mono text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!me) return null

  return <>{children}</>
}
