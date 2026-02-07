import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message);
        return;
      }
      setIsSubmitted(true);
      toast.success("Reset email sent!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 shadow-card">
            {isSubmitted ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold mb-2">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Click the link in the email to reset your password.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display text-2xl font-bold mb-2">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hero@example.com"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
