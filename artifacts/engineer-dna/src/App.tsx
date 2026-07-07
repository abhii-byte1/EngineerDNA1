import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';

// Component Pages
import Home from '@/pages/home';
import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import GithubDNA from '@/pages/github-dna';
import PortfolioDNA from '@/pages/portfolio-dna';
import ResumeDNA from '@/pages/resume-dna';
import RoadmapPage from '@/pages/roadmap';
import JournalPage from '@/pages/journal';
import MentorPage from '@/pages/mentor';
import GoalsPage from '@/pages/goals';
import SettingsPage from '@/pages/settings';

// Layout & Auth
import { AppLayout } from '@/components/layout';
import { AuthGuard } from '@/components/auth-guard';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthGuard>
      <AppLayout>
        <Component />
      </AppLayout>
    </AuthGuard>
  )
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/github-dna"><ProtectedRoute component={GithubDNA} /></Route>
      <Route path="/portfolio-dna"><ProtectedRoute component={PortfolioDNA} /></Route>
      <Route path="/resume-dna"><ProtectedRoute component={ResumeDNA} /></Route>
      <Route path="/roadmap"><ProtectedRoute component={RoadmapPage} /></Route>
      <Route path="/journal"><ProtectedRoute component={JournalPage} /></Route>
      <Route path="/mentor"><ProtectedRoute component={MentorPage} /></Route>
      <Route path="/goals"><ProtectedRoute component={GoalsPage} /></Route>
      <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="engineer-dna-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
