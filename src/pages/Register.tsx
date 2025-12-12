import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInputWithLabel } from "@/components/ui/form-components";
import { useAuth } from "@/components/context/AuthContext";
import { showToast, handleFormError } from "@/lib/utils/form";
import { Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const {
    register: registerField,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();
  const { register } = useAuth();
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data.username, data.email, data.password);
      showToast({ title: "Account created successfully!", variant: "success" });
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
        <div className="absolute top-4 right-4 z-10">
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
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground">
              Join our community and start engaging
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>
                Fill in the details below to create your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormInputWithLabel
                  name="username"
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  register={registerField}
                  error={errors.username}
                  validators={{
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    maxLength: {
                      value: 20,
                      message: "Username must not exceed 20 characters",
                    },
                  }}
                  disabled={isSubmitting}
                />

                <FormInputWithLabel
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  register={registerField}
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
                  register={registerField}
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

                <FormInputWithLabel
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  register={registerField}
                  error={errors.confirmPassword}
                  validators={{
                    required: "Please confirm your password",
                    validate: (value: string) =>
                      value === password || "Passwords do not match",
                  }}
                  disabled={isSubmitting}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Sign in link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:block relative bg-linear-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md space-y-6">
            <div className="rounded-full bg-primary/10 p-6 inline-block">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Start Your Journey
            </h2>
            <p className="text-lg text-muted-foreground">
              Create an account to access all features and connect with our amazing community.
            </p>
            
            {/* Features List */}
            <div className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold">Real-time Comments</div>
                  <div className="text-sm text-muted-foreground">
                    See updates instantly with WebSocket technology
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold">Nested Replies</div>
                  <div className="text-sm text-muted-foreground">
                    Engage in threaded conversations
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold">Like & Dislike</div>
                  <div className="text-sm text-muted-foreground">
                    Express your opinions on comments
                  </div>
                </div>
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
