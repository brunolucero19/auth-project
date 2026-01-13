"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser(data);
      } catch (error) {
        // Handle error (redirect to login handled by layout/interceptor usually)
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">¡Bienvenido al Panel de Control!</h1>
      <Card>
        <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>Estos son los detalles de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
            {user ? (
                <div className="grid gap-2">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Nombre:</strong> {user.name || "No definido"}</p>
                    <p><strong>Rol:</strong> {user.role}</p>
                </div>
            ) : (
                <p>Cargando información del usuario...</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
