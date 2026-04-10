import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { ClerkAuthProvider, NoAuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import History from "@/pages/History";
import AnalysisView from "@/pages/AnalysisView";
import Playground from "@/pages/Playground";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient();

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function NoAuthPage({ title }: { title: string }) {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <div className="text-center p-8 rounded-xl border border-white/10 bg-card">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground">
          Add <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> to enable authentication.
        </p>
      </div>
    </div>
  );
}

function SignInPage() {
  if (!clerkPubKey) return <NoAuthPage title="Authentication not configured" />;
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  if (!clerkPubKey) return <NoAuthPage title="Authentication not configured" />;
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }: any) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppShell({ withClerk }: { withClerk: boolean }) {
  const AuthProviderComp = withClerk ? ClerkAuthProvider : NoAuthProvider;
  return (
    <QueryClientProvider client={queryClient}>
      {withClerk && <ClerkCacheInvalidator />}
      <AuthProviderComp>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
            <Navbar />
            <main className="flex-1 relative">
              <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
              </div>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/sign-in/*?" component={SignInPage} />
                <Route path="/sign-up/*?" component={SignUpPage} />
                <Route path="/history" component={History} />
                <Route path="/playground" component={Playground} />
                <Route path="/analyze/:id" component={AnalysisView} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProviderComp>
    </QueryClientProvider>
  );
}

function AppWithClerk() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      localization={{
        signIn: { start: { title: 'Sign in to AlgoViz AI', subtitle: 'Welcome back! Please sign in to continue' } },
        signUp: { start: { title: 'Create your AlgoViz AI account', subtitle: 'Welcome! Please fill in the details to get started.' } },
      }}
      appearance={{
        layout: { socialButtonsPlacement: 'bottom', socialButtonsVariant: 'blockButton' },
        variables: {
          colorPrimary: 'hsl(217, 91%, 60%)',
          colorBackground: 'hsl(225, 25%, 9%)',
          colorText: 'white',
          colorTextSecondary: 'rgba(255,255,255,0.65)',
          colorInputBackground: 'hsl(225, 30%, 15%)',
          colorInputText: 'white',
          colorNeutral: 'white',
        },
        elements: {
          headerTitle: { color: 'white' },
          headerSubtitle: { color: 'rgba(255,255,255,0.6)' },
          formFieldLabel: { color: 'rgba(255,255,255,0.7)' },
          dividerText: { color: 'rgba(255,255,255,0.4)' },
          socialButtonsBlockButton: {
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '10px',
            color: 'white',
            transition: 'background-color 0.15s',
          },
          socialButtonsBlockButtonText: { color: 'white', fontWeight: '500' },
          badge: { display: 'none' },
          tagBadge: { display: 'none' },
          footer: { display: 'none' },
        },
      }}
    >
      <AppShell withClerk={true} />
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      {clerkPubKey ? <AppWithClerk /> : <AppShell withClerk={false} />}
    </WouterRouter>
  );
}

export default App;
