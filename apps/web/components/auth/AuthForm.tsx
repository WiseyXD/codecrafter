"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { handleSignInAndRedirect } from "@/actions/auth";

// Form validation schema from the original code
const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle email authentication - from the original code's pattern
  const handleEmailAuth = async (redirectPath: string) => {
    try {
      // This would be implemented with actual authentication logic
      console.log(`Authenticating with email: ${form.getValues().email}`);
      console.log(`Will redirect to: ${redirectPath}`);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = redirectPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      throw err;
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setError(null);
    setEmailLoading(true);
    try {
      await handleEmailAuth("/dashboard");
    } catch (err) {
      // Error already set in handleEmailAuth
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-zinc-950">
      <div className="max-w-md m-auto h-fit w-full">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
          <div>
            <Link href="/" aria-label="go home">
              <Logo />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold dark:text-white">
              Create an Account
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Welcome! Create an account to get started
            </p>
          </div>

          {error && (
            <Alert className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium border-zinc-300 dark:border-zinc-700 dark:text-white"
              onClick={() => handleSignInAndRedirect("/dashboard")}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 262"
                    className="mr-2"
                  >
                    <path
                      fill="#4285f4"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    ></path>
                    <path
                      fill="#34a853"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    ></path>
                    <path
                      fill="#fbbc05"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    ></path>
                    <path
                      fill="#eb4335"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    ></path>
                  </svg>
                  Continue with Google
                </span>
              )}
            </Button>
          </div>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="dark:bg-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                Or continue with email
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label htmlFor="email" className="block text-sm">
                      Email
                    </Label>
                    <FormControl>
                      <Input
                        type="email"
                        id="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={emailLoading}>
                {emailLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="dark:bg-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                or
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => (window.location.href = "/demo")}
            variant="outline"
            className="w-full h-11 font-medium border-zinc-300 dark:border-zinc-700 dark:text-white mt-6"
          >
            <span className="flex items-center">
              <PlayCircle className="mr-2 h-4 w-4" />
              Try Demo
            </span>
          </Button>
        </div>

        <p className="text-center text-sm mt-6 text-zinc-600 dark:text-zinc-400">
          Have an account?
          <Button asChild variant="link" className="px-2">
            <Link href="/login">
              Sign In <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </p>

        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  );
}
// "use client";

// import { z } from "zod";
// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Separator } from "@/components/ui/separator";
// import {
//   ArrowRight,
//   Mail,
//   LineChart,
//   TrendingUp,
//   Bot,
//   BarChart3,
//   PlayCircle,
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// const formSchema = z.object({
//   email: z
//     .string()
//     .min(1, "Email is required")
//     .email("Please enter a valid email address"),
// });

// type FormValues = z.infer<typeof formSchema>;

// interface AuthFormProps {
//   mode: "login" | "signup";
//   title: string;
//   description: string;
//   handleEmailAuth: (redirectPath: string) => Promise<void>;
//   handleGoogleAuth: (redirectPath: string) => Promise<void>;
//   searchParams: { invite?: string };
//   alternateAuthLink?: {
//     text: string;
//     href: string;
//   };
//   defaultEmail?: string;
// }

// export default function AuthForm({
//   mode,
//   title,
//   description,
//   handleEmailAuth,
//   handleGoogleAuth,
//   searchParams,
//   alternateAuthLink,
//   defaultEmail,
// }: AuthFormProps) {
//   const [emailLoading, setEmailLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: defaultEmail || "",
//     },
//   });

//   // const onSubmit = async (values: FormValues) => {
//   //   setError(null);
//   //   setEmailLoading(true);
//   //   try {
//   //     await handleEmailAuth(values.email, "/dashboard");
//   //   } catch (err) {
//   //     setError(err instanceof Error ? err.message : "Authentication failed");
//   //   } finally {
//   //     setEmailLoading(false);
//   //   }
//   // };

//   const benefits = [
//     {
//       icon: <LineChart className="h-6 w-6 text-blue-500" />,
//       title: "Real-time Analytics",
//       description:
//         "Track your Amazon store performance with live metrics and insights",
//     },
//     {
//       icon: <TrendingUp className="h-6 w-6 text-green-500" />,
//       title: "Growth Insights",
//       description: "Identify trending products and optimization opportunities",
//     },
//     {
//       icon: <Bot className="h-6 w-6 text-purple-500" />,
//       title: "AI-Powered Analysis",
//       description: "Get intelligent recommendations for your product portfolio",
//     },
//     {
//       icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
//       title: "Performance Tracking",
//       description: "Monitor KPIs and track your business growth over time",
//     },
//   ];

//   return (
//     <div className="min-h-screen w-full dark:bg-zinc-950">
//       <div className="container relative mx-auto px-4 flex flex-col min-h-screen py-8">
//         {/* Main Content Section - Added padding */}
//         <div className="flex-1 flex items-center justify-center py-16">
//           <div className="w-full flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center max-w-6xl">
//             {/* Benefits Section - Hidden on mobile */}
//             <div className="hidden lg:block w-full max-w-xl">
//               <div className="pr-12">
//                 <h2 className="text-3xl font-bold mb-4 dark:text-white">
//                   Supercharge Your Amazon Business
//                 </h2>
//                 <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg">
//                   Join thousands of sellers using Revns to optimize their Amazon
//                   business with AI-powered insights.
//                 </p>

//                 <div className="grid gap-6">
//                   {benefits.map((benefit, index) => (
//                     <div
//                       key={index}
//                       className="flex gap-4 items-start p-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
//                     >
//                       <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
//                         {benefit.icon}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold dark:text-white text-lg">
//                           {benefit.title}
//                         </h3>
//                         <p className="text-zinc-600 dark:text-zinc-400">
//                           {benefit.description}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Auth Form Section */}
//             <div className="w-full max-w-md">
//               <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
//                 <CardHeader className="space-y-1 pb-6">
//                   <CardTitle className="text-2xl font-bold dark:text-white">
//                     {title}
//                   </CardTitle>
//                   <CardDescription className="dark:text-zinc-400">
//                     {description}
//                   </CardDescription>
//                 </CardHeader>

//                 <CardContent className="space-y-6">
//                   {/* Mobile Benefits Preview */}
//                   <div className="lg:hidden grid grid-cols-1 gap-4 mb-6">
//                     {benefits.slice(0, 2).map((benefit, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
//                       >
//                         <div className="p-2 rounded-lg bg-white dark:bg-zinc-700">
//                           {benefit.icon}
//                         </div>
//                         <div>
//                           <h3 className="font-semibold dark:text-white text-sm">
//                             {benefit.title}
//                           </h3>
//                           <p className="text-xs text-zinc-600 dark:text-zinc-400">
//                             {benefit.description}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <Button
//                     type="button"
//                     onClick={() => handleGoogleAuth("/dashboard")}
//                     variant="outline"
//                     className="w-full h-11 font-medium border-zinc-300 dark:border-zinc-700 dark:text-white"
//                     disabled={googleLoading}
//                   >
//                     {googleLoading ? (
//                       <span className="flex items-center">
//                         <svg
//                           className="animate-spin -ml-1 mr-3 h-4 w-4"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                           />
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                           />
//                         </svg>
//                         Connecting...
//                       </span>
//                     ) : (
//                       <span className="flex items-center">
//                         <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//                           <path
//                             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                             fill="#4285F4"
//                           />
//                           <path
//                             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                             fill="#34A853"
//                           />
//                           <path
//                             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                             fill="#FBBC05"
//                           />
//                           <path
//                             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                             fill="#EA4335"
//                           />
//                         </svg>
//                         Continue with Google
//                       </span>
//                     )}
//                   </Button>

//                   <div className="relative">
//                     <div className="absolute inset-0 flex items-center">
//                       <Separator className="dark:bg-zinc-800" />
//                     </div>
//                     <div className="relative flex justify-center text-xs uppercase">
//                       <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
//                         or continue with
//                       </span>
//                     </div>
//                   </div>
//                   <div className="relative">
//                     <div className="absolute inset-0 flex items-center">
//                       <Separator className="dark:bg-zinc-800" />
//                     </div>
//                     <div className="relative flex justify-center text-xs uppercase">
//                       <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
//                         or
//                       </span>
//                     </div>
//                   </div>
//                   {/* Demo button */}
//                   <Button
//                     type="button"
//                     onClick={() => (window.location.href = "/demo")}
//                     variant="outline"
//                     className="w-full h-11 font-medium border-zinc-300 dark:border-zinc-700 dark:text-white mb-4"
//                   >
//                     <span className="flex items-center">
//                       <PlayCircle className="mr-2 h-4 w-4" />
//                       Try Demo
//                     </span>
//                   </Button>
//                 </CardContent>

//                 {alternateAuthLink && (
//                   <CardFooter className="flex justify-center pt-2 pb-4">
//                     <Button
//                       variant="link"
//                       className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
//                       onClick={() =>
//                         (window.location.href = alternateAuthLink.href)
//                       }
//                     >
//                       {alternateAuthLink.text}
//                       <ArrowRight className="ml-2 h-4 w-4" />
//                     </Button>
//                   </CardFooter>
//                 )}
//               </Card>

//               {/* Footer moved outside the Card with better spacing */}
//               <div className="mt-6 mb-4 px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
//                 By continuing, you agree to our{" "}
//                 <Link
//                   href="https://www.revns.com/terms"
//                   target="_blank"
//                   className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
//                 >
//                   Terms
//                 </Link>{" "}
//                 and{" "}
//                 <Link
//                   href="https://www.revns.com/privacy-policy"
//                   target="_blank"
//                   className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
//                 >
//                   Privacy Policy
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
