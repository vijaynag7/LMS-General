import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@edusaas/shared";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const { signInWithPassword, signInWithGoogle } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setSubmitting(true);
    try {
      await signInWithPassword(values.email, values.password);
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/app";
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in{tenant ? ` to ${tenant.name}` : ""}</CardTitle>
          <CardDescription>Welcome back — enter your details to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="brand" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <Button variant="outline" className="w-full" onClick={() => signInWithGoogle()}>
            Continue with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-foreground underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
