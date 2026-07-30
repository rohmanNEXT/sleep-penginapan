"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WithUser(Component: any) {
  return function UserComponent(props: any) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      if (!user) {
        toast.error("Masuk Terlebih Dahulu", { description: "Silakan login untuk mengakses halaman ini." });
        router.push("/");
      } else if (user.role === "admin" || user.role === "superadmin") {
        toast.error("Akses Ditolak", { description: "Admin tidak dapat melakukan pembelian penginapan." });
        router.back();
      }
    }, [user, router]);

    if (!isMounted || !user || user.role === "admin" || user.role === "superadmin") {
      return null;
    }

    return <Component {...props} />;
  };
}
