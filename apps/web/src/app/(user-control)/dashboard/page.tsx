"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Import page content components directly
import ProfilePage from "./profile/page";
import SavePenginapanPage from "./save-penginapan/page";
import KelolaAdminPage from "./kelola-penginapan/page";
import KelolaKuponPage from "./kelola-kupon/page";
import BalancePage from "./balance/page";
import Image from "next/image";

type SidebarTab = "profile" | "saved" | "admin" | "coupon" | "balance";

const DashboardContent: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab state controlled by URL tab query param or state fallback
  const [activeTab, setActiveTab] = useState<SidebarTab>("profile");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/");
    }
  }, [user, router, isHydrated]);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as SidebarTab;
    if (tabParam && ["profile", "saved", "admin", "coupon", "balance"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] pt-4 pb-24 px-4 sm:px-6 font-['Space_Grotesk'] antialiased">
        <div className="max-w-325 mx-auto">
          <div className="bg-white border-[3px] border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_black] flex flex-col items-center justify-center h-207.5">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="font-black uppercase tracking-widest text-[10px] text-stone-500 animate-pulse">Memuat Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab);
    router.replace(`/dashboard?tab=${tab}`);
  };

  const isTabActive = (tab: SidebarTab) => activeTab === tab;

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-4 pb-24 px-4 sm:px-6 font-['Space_Grotesk'] antialiased">
      <div className="max-w-325 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border-[3px] border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_black]">

              {/* User Identity mini Card */}
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b-2 border-black/10">
                <div className="w-11 h-11 border-2 border-black rounded-full overflow-hidden shrink-0 bg-stone-100">
                  <Image
  src={user.avatar || "/images/avatar.svg"}
  alt="avatar"
  width={100}
  height={100}
  className="w-full h-full object-cover grayscale"
/> </div>
                <div className="overflow-hidden">
                  <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest leading-none">Role: {user.role}</p>
                  <p className="text-xs font-black truncate text-black mt-1 leading-none uppercase">{user.name || user.email}</p>
                </div>
              </div>

              {/* Sidebar Menu Items */}
              <div className="space-y-1.5">
                <button
                  onClick={() => handleTabChange("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${isTabActive("profile") ? "bg-[#ffcc00] border-black shadow-[2.5px_2.5px_0px_0px_black]" : "bg-white border-transparent hover:border-black hover:bg-stone-50"}`}
                >
                  <span className="text-sm">👤</span>
                  <span>User Profile</span>
                </button>

                <button
                  onClick={() => handleTabChange("saved")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${isTabActive("saved") ? "bg-[#ffcc00] border-black shadow-[2.5px_2.5px_0px_0px_black]" : "bg-white border-transparent hover:border-black hover:bg-stone-50"}`}
                >
                  <span className="text-sm">🔖</span>
                  <span>Save Penginapan</span>
                </button>

                {user.role === 'admin' && (
                  <>
                    <button
                      onClick={() => handleTabChange("admin")}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-xs font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${isTabActive("admin") ? "bg-[#ffcc00] border-black shadow-[2.5px_2.5px_0px_0px_black]" : "bg-white border-transparent hover:border-black hover:bg-stone-50"}`}
                    >
                      <span className="text-sm">🛠️</span>
                      <span>Kelola Penginapan </span>
                    </button>

                    <button
                      onClick={() => handleTabChange("coupon")}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${isTabActive("coupon") ? "bg-[#ffcc00] border-black shadow-[2.5px_2.5px_0px_0px_black]" : "bg-white border-transparent hover:border-black hover:bg-stone-50"}`}
                    >
                      <span className="text-sm">🎟️</span>
                      <span>Kelola Coupon </span>
                    </button>
                  </>
                )}

                {user.role === 'superadmin' && (
                  <button
                    onClick={() => handleTabChange("coupon")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${isTabActive("coupon") ? "bg-[#ffcc00] border-black shadow-[2.5px_2.5px_0px_0px_black]" : "bg-white border-transparent hover:border-black hover:bg-stone-50"}`}
                  >
                    <span className="text-sm">🎟️</span>
                    <span>Kelola Global Coupon </span>
                  </button>
                )}

                <button
                  onClick={() => handleTabChange("balance")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase rounded-xl border-2 transition-all cursor-pointer ${isTabActive("balance") ? "bg-[#ffcc00] border-black shadow-[2.5px_2.5px_0px_0px_black]" : "bg-white border-transparent hover:border-black hover:bg-stone-50"}`}
                >
                  <span className="text-sm">💰</span>
                  <span>Balance</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Content Area — filled dynamically by active tab */}
          <div className="lg:col-span-9">
            {activeTab === "profile" && <ProfilePage />}
            {activeTab === "saved" && <SavePenginapanPage />}
            {activeTab === "admin" && user.role === 'admin' && <KelolaAdminPage />}
            {activeTab === "coupon" && (user.role === 'admin' || user.role === 'superadmin') && <KelolaKuponPage />}
            {activeTab === "balance" && <BalancePage />}
          </div>

        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f0e8] pt-4 pb-24 px-4 sm:px-6 font-['Space_Grotesk'] antialiased">
        <div className="max-w-325 mx-auto">
          <div className="bg-white border-[3px] border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_black] flex flex-col items-center justify-center h-207.5">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="font-black uppercase tracking-widest text-[10px] text-stone-500 animate-pulse">Memuat Dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;
