"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WithAll(Component: any) {
  return function AllUserComponent(props: any) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      if (!user) {
        toast.error("Masuk Terlebih Dahulu", { description: "Silakan login untuk mengakses halaman ini." });
        router.push("/");
      }
    }, [user, router]);

    if (!isMounted || !user) {
      return null;
    }

    return <Component {...props} />;
  };
}
