"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser(data);
      } catch (error) {
        // Error handling handled by layout/interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Access Denied</div>;

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configuración del Perfil</h1>
        <ProfileForm user={user} />
    </div>
  );
}
