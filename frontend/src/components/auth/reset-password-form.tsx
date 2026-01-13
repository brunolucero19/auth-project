"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Token de restablecimiento inválido.");
      // Optionally redirect
    }
  }, [token]);

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
        toast.error("Token faltante.");
        return;
    }
    try {
      await api.post("/auth/reset-password", { token, password: data.password });
      toast.success("Contraseña restablecida exitosamente.");
      router.push("/auth/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al restablecer contraseña";
      toast.error(message);
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Nueva Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Restablecer Contraseña
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <a href="/auth/login" className="text-sm text-muted-foreground hover:underline">
          Volver al inicio de sesión
        </a>
      </CardFooter>
    </Card>
  );
}

export function ResetPasswordForm() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordFormContent />
        </Suspense>
    )
}
