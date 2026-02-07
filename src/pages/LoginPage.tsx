import { Layout } from "@/components/layout/Layout";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <AuthForm mode="login" />
      </div>
    </Layout>
  );
}
