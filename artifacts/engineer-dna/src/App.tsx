import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';

// Static / Lightweight Core Pages
import Home from '@/pages/home';
import Login from '@/pages/login';

// Lazy Loaded Route-Level Components for Code Splitting
const Dashboard = React.lazy(() => import('@/pages/dashboard'));
const GithubDNA = React.lazy(() => import('@/pages/github-dna'));
const ResumeDNA = React.lazy(() => import('@/pages/resume-dna'));
const RoadmapPage = React.lazy(() => import('@/pages/roadmap'));
const GoalsPage = React.lazy(() => import('@/pages/goals'));
const SettingsPage = React.lazy(() => import('@/pages/settings'));
const PublicProfile = React.lazy(() => import('@/pages/public-profile'));
const RoastPage = React.lazy(() => import('@/pages/roast'));
const LeaderboardPage = React.lazy(() => import('@/pages/leaderboard'));
const ComparePage = React.lazy(() => import('@/pages/compare'));
const InterviewSimulator = React.lazy(() => import('@/pages/interview-simulator'));
const AdminPage = React.lazy(() => import('@/pages/admin'));
const AboutPage = React.lazy(() => import('@/pages/about'));

// Layout & Auth
import { AppLayout } from '@/components/layout';
import { AdminLayout } from '@/components/admin-layout';
import { AuthGuard } from '@/components/auth-guard';

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthGuard>
      <AppLayout>
        <React.Suspense fallback={<PageLoader />}>
          <Component />
        </React.Suspense>
      </AppLayout>
    </AuthGuard>
  );
}

function AdminRoute() {
  return (
    <AuthGuard>
      <AdminLayout>
        <React.Suspense fallback={<PageLoader />}>
          <AdminPage />
        </React.Suspense>
      </AdminLayout>
    </AuthGuard>
  );
}

function Router() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/about" component={AboutPage} />
        <Route path="/u/:username" component={PublicProfile} />
        <Route path="/roast" component={RoastPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/compare/:user1/:user2" component={ComparePage} />

        <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
        <Route path="/github-dna"><ProtectedRoute component={GithubDNA} /></Route>
        <Route path="/resume-dna"><ProtectedRoute component={ResumeDNA} /></Route>
        <Route path="/roadmap"><ProtectedRoute component={RoadmapPage} /></Route>
        <Route path="/goals"><ProtectedRoute component={GoalsPage} /></Route>
        <Route path="/interview-simulator"><ProtectedRoute component={InterviewSimulator} /></Route>
        <Route path="/admin"><AdminRoute /></Route>
        <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>

        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
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
