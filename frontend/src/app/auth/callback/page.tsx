"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const error = searchParams.get("error");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      toast.success("¡Inicio de sesión con OAuth exitoso!");
      router.push("/dashboard");
    } else if (error) {
      toast.error("Error al iniciar sesión. Por favor intenta de nuevo.");
      router.push("/auth/login");
    } else {
        // Fallback
        router.push("/auth/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-semibold">Autenticando...</h2>
        <p className="text-muted-foreground">Por favor espera mientras iniciamos tu sesión.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
