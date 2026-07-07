import { Link } from "wouter"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-4">
      <div className="font-mono text-primary text-6xl font-bold mb-4">404</div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Endpoint Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The requested resource does not exist in the system. Check the path and try again.
      </p>
      <Link href="/dashboard">
        <Button className="font-mono">Return to Dashboard</Button>
      </Link>
    </div>
  )
}
