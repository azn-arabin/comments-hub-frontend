import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInputWithLabel } from "@/components/ui/form-components";
import { useAuth } from "@/components/context/AuthContext";
import { showToast, handleFormError } from "@/lib/utils/form";
import { Loader2, MessageSquare } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      showToast({ title: "Logged in successfully!", variant: "success" });
      navigate("/");
    } catch (error: unknown) {
      if ((error as any).response?.data?.message) {
        showToast({ title: (error as any).response.data.message, variant: "error" });
      } else {
        handleFormError({ setError, error });
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-3">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormInputWithLabel
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  register={register}
                  error={errors.email}
                  validators={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  disabled={isSubmitting}
                />

                <FormInputWithLabel
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  register={register}
                  error={errors.password}
                  validators={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  disabled={isSubmitting}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Sign up link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:block relative bg-linear-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md space-y-6 text-center">
            <div className="rounded-full bg-primary/10 p-6 inline-block">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Join the Conversation
            </h2>
            <p className="text-lg text-muted-foreground">
              Share your thoughts, engage with others, and be part of a vibrant community.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
      </div>
    </div>
  );
}
