import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "@/lib/utils";
import { useContext, useState } from "react";
import { AuthContext } from "@/ContextApi";
import { useNavigate } from "react-router";

const formSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string(),
  // .min(8, { message: "Password must be at least 8 characters." })
  // .max(16, { message: "Password must be at most 16 characters." })
  // .regex(/[A-Z]/, {
  //   message: "Password must contain at least one uppercase letter.",
  // })
  // .regex(/[^A-Za-z0-9]/, {
  //   message: "Password must contain at least one special character.",
  // }),
});

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const { setAuth, setUser } = useContext(AuthContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { data } = await axios.post(`${baseUrl}/auth/login`, values);
      delete data.user.password;
      setUser({ ...data.user, token: data.token });
      setAuth(true);
      toast.success(data.message);
      if (data.user.role === "ADMIN") navigate("/admin-dashboard");
      if (data.user.role === "STORE_OWNER") navigate("/owner-dashboard");
      if (data.user.role === "USER") navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 min-h-screen">
      <Card className="shadow-xl border border-gray-200 rounded-2xl w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        {...field}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="py-2 rounded-xl w-full text-base"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-gray-600 text-sm text-center">
            Don’t have an account?{" "}
            <Button variant="link" className="p-0 font-semibold" asChild>
              <a href="/register">Register</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
