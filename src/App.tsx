import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import CharacterPreviewPage from "@/pages/CharacterPreviewPage";
import CharacterDetailPage from "@/pages/CharacterDetailPage";
import LibraryPage from "@/pages/LibraryPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/character/:id/preview" element={<CharacterPreviewPage />} />
            <Route path="/character/:id" element={<CharacterDetailPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'hsl(222 41% 18%)',
                border: '1px solid hsl(222 41% 25%)',
                color: 'hsl(210 40% 98%)',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
