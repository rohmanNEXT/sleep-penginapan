"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import Image from "next/image";

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    age: "",
    phone: "",
    address: "",
    avatar: ""
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        age: user.age ? String(user.age) : "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white border-[3px] border-black px-3 py-4 sm:px-4 sm:py-5 md:p-6 rounded-2xl shadow-[6px_6px_0px_0px_black] space-y-6 h-217.5 overflow-y-auto">
      <div className="border-b-[3px] border-black pb-4 mb-4 flex justify-between items-center shrink-0 gap-2">
        <div>
          <h2 className="sm:text-lg md:text-2xl font-black uppercase tracking-tight">User Profile</h2>
          <p className="text-[8px] sm:text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">
            Detail informasi akun resmi Anda</p>
        </div>
        {!isEditingProfile && (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="bg-[#ffcc00] text-black border-2 border-black px-4 py-2 rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-black">edit</span>
            Edit Profil
          </button>
        )}
      </div>

      {isEditingProfile ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[9px] font-black uppercase text-stone-500">Avatar Image (Upload File atau URL)</label>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="w-16 h-16 border-[3px] border-black rounded-full overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_black] bg-white relative self-center">
                 <Image
  src={profileForm.avatar || "/images/avatar.svg"}
  alt="Preview"
  width={100}
  height={100}
  className="w-full h-full object-cover"
/>                </div>
                <div className="grow space-y-2">
                  <input
                    type="text"
                    value={profileForm.avatar}
                    onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="Paste image URL here..."
                    className="w-full bg-stone-50 border-2 border-black p-3 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <label className="bg-black text-white hover:bg-[#ffcc00] hover:text-black border-2 border-black px-4 py-2 rounded-xl font-black text-[9px] uppercase shadow-[2.5px_2.5px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer text-center inline-block">
                      📤 Upload Foto File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
                              toast.success("Foto profil berhasil dimuat!");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {profileForm.avatar && (
                      <button type="button" onClick={() => setProfileForm(prev => ({ ...prev, avatar: "" }))} className="cursor-pointer ml-2 text-[9px] font-black uppercase text-red-600 hover:underline">
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="profile-name" className="block text-[9px] font-black uppercase text-stone-500 mb-1.5">Nama Lengkap</label>
              <input id="profile-name" name="profile-name" title="Nama Lengkap" placeholder="Masukkan nama lengkap" type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all" />
            </div>

            <div>
              <label htmlFor="profile-age" className="block text-[9px] font-black uppercase text-stone-500 mb-1.5">Umur</label>
              <input
                id="profile-age"
                name="profile-age"
                title="Umur"
                placeholder="Masukkan umur"
                type="number"
                value={profileForm.age}
                onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className="block text-[9px] font-black uppercase text-stone-500 mb-1.5">Nomor HP</label>
              <input
                id="profile-phone"
                name="profile-phone"
                title="Nomor HP"
                placeholder="Masukkan nomor HP"
                type="text"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-[9px] font-black uppercase text-stone-500 mb-1.5">Alamat Email (Read Only)</label>
              <input id="profile-email" name="profile-email" type="email" readOnly value={user.email} title="Alamat Email" placeholder="Alamat email Anda" aria-readonly="true" className="w-full bg-stone-100 border-2 border-black/20 p-3 font-bold text-xs rounded-xl outline-none" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="profile-address" className="block text-[9px] font-black uppercase text-stone-500 mb-1.5">Alamat Tinggal</label>
              <textarea
                id="profile-address"
                rows={3}
                title="Alamat Tinggal"
                placeholder="Masukkan alamat tinggal"
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full bg-stone-50 border-2 border-black p-3 font-bold text-xs rounded-xl outline-none focus:ring-4 focus:ring-[#ffcc00]/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-black/5">
            <button
              onClick={() => {
                if (!profileForm.name.trim()) { toast.error("Nama lengkap wajib diisi!"); return; }
                const updatedUser = { ...user, name: profileForm.name, age: Number(profileForm.age) || undefined, phone: profileForm.phone, address: profileForm.address, avatar: profileForm.avatar };
                setUser(updatedUser);
                const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
                const index = users.findIndex((u: any) => u.email === user.email);
                if (index !== -1) {
                  users[index] = { ...users[index], name: profileForm.name, age: Number(profileForm.age) || undefined, phone: profileForm.phone, address: profileForm.address, avatar: profileForm.avatar };
                  localStorage.setItem('registered_users', JSON.stringify(users));
                }
                setIsEditingProfile(false);
                toast.success("Profil berhasil diperbarui!");
              }}
              className="bg-black text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_rgba(255,204,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer border-2 border-black"
            >
              Simpan Perubahan
            </button>
            <button
              onClick={() => {
                setProfileForm({ name: user.name || "", age: user.age ? String(user.age) : "", phone: user.phone || "", address: user.address || "", avatar: user.avatar || "" });
                setIsEditingProfile(false);
              }}
              className="bg-white border-2 border-black px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col items-center justify-center p-6 bg-stone-50 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_black] text-center lg:col-span-1">
            <div className="w-24 h-24 border-[3px] border-black rounded-full overflow-hidden mb-4 bg-white relative">
              <Image
  src={user.avatar || "/images/avatar.svg"}
  alt="avatar"
  width={100}
  height={100}
  className="w-full h-full object-cover grayscale"
/>            </div>
            <h4 className="font-black text-lg uppercase leading-none tracking-tight">{user.name || "N/A"}</h4>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1.5 bg-black px-2 py-0.5 rounded border border-black">{user.role}</p>
            <p className="text-xs text-stone-500 font-bold mt-4">Bergabung sejak Mei 2026</p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_0px_black] flex flex-col justify-center">
              <label className="text-[8px] font-black uppercase text-stone-400 mb-0.5">👤 Nama Lengkap</label>
              <span className="font-black text-sm text-black">{user.name || "-"}</span>
            </div>
            <div className="bg-stone-50 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_0px_black] flex flex-col justify-center">
              <label className="text-[8px] font-black uppercase text-stone-400 mb-0.5">🎂 Umur</label>
              <span className="font-black text-sm text-black">{user.age ? `${user.age} Tahun` : "-"}</span>
            </div>
            <div className="bg-stone-50 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_0px_black] flex flex-col justify-center">
              <label className="text-[8px] font-black uppercase text-stone-400 mb-0.5">📞 Nomor HP</label>
              <span className="font-black text-sm text-black">{user.phone || "-"}</span>
            </div>
            <div className="bg-stone-50 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_0px_black] flex flex-col justify-center">
              <label className="text-[8px] font-black uppercase text-stone-400 mb-0.5">✉️ Alamat Email</label>
              <span className="font-black text-xs text-black break-all">{user.email}</span>
            </div>
            <div className="bg-stone-50 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_0px_black] flex flex-col justify-center md:col-span-2">
              <label className="text-[8px] font-black uppercase text-stone-400 mb-0.5">📍 Alamat Tinggal</label>
              <span className="font-black text-xs text-black leading-relaxed">{user.address || "-"}</span>
            </div>
            <div className="bg-stone-50 border-2 border-dashed border-black/20 p-4 rounded-xl flex flex-col justify-center md:col-span-2">
              <label className="text-[8px] font-black uppercase text-stone-400 mb-0.5">🔑 ID Pengguna</label>
              <span className="font-mono text-[9px] text-stone-500 select-all">{user.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
