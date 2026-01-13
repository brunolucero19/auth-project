"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useEffect } from "react";

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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal('')),
  image: z.string().url("URL de imagen inválida").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      image: user?.image || "",
      password: "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Filter out empty password if not provided
      const payload: any = { ...data };
      if (!payload.password) delete payload.password;
      
      await api.patch("/users/profile", payload);
      toast.success("¡Perfil actualizado exitosamente!");
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al actualizar perfil";
      toast.error(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu Perfil</CardTitle>
        <CardDescription>Actualiza tu información personal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tucorreo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Dejar en blanco para mantener la actual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Avatar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/foto.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
