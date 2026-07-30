"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WithAdmin(Component: any) {
  return function AdminComponent(props: any) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      if (!user) {
        toast.error("Masuk Terlebih Dahulu", { description: "Silakan login untuk mengakses halaman ini." });
        router.push("/");
      } else if (user.role !== "admin" && user.role !== "superadmin") {
        toast.error("Akses Ditolak", { description: "Halaman ini khusus untuk Admin." });
        router.push("/");
      }
    }, [user, router]);

    if (!isMounted || !user || (user.role !== "admin" && user.role !== "superadmin")) {
      return null;
    }

    return <Component {...props} />;
  };
}
