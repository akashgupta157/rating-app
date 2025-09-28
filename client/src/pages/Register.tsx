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
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "@/lib/utils";
import { useContext, useState } from "react";
import { AuthContext } from "@/ContextApi";
import { useNavigate } from "react-router";

const formSchema = z.object({
  name: z
    .string()
    .min(20, { message: "Name must be at least 20 characters." })
    .max(60, { message: "Name must be at most 60 characters." }),
  address: z
    .string()
    .max(400, { message: "Address must be at most 400 characters." })
    .optional(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(16, { message: "Password must be at most 16 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setAuth, setUser } = useContext(AuthContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { data } = await axios.post(`${baseUrl}/auth/register`, {
        ...values,
        role: "USER",
      });
      delete data.user.password;
      setUser({ ...data.user, token: data.token });
      setAuth(true);
      toast.success(data.message);
      navigate("/");
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
          <CardTitle className="font-bold text-3xl">Create Account</CardTitle>
          <CardDescription>
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name (20-60 characters)"
                        type="text"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your address"
                        {...field}
                        className="rounded-xl min-h-[80px]"
                        maxLength={400}
                      />
                    </FormControl>
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>{field.value?.length || 0}/400 characters</span>
                    </div>
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
                className="mt-2 py-2 rounded-xl w-full text-base"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-gray-600 text-sm text-center">
            Already have an account?{" "}
            <Button variant="link" className="p-0 font-semibold" asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
