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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
