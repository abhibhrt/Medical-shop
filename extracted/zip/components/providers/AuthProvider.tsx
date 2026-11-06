// components/providers/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);

        // 1. Check karein ki kya session me pehle se user cached hai (Page reload par bhi yhi se kaam chal jayega)
        const cachedUser = sessionStorage.getItem("auth_user");
        if (cachedUser) {
          const user = JSON.parse(cachedUser);
          setAuth({
            id: user.id,
            name: user.name,
            email: user.email,
            mob_no: user.mob_no,
            role: user.role,
            status: user.status,
            is_profile_complete: user.is_profile_complete,
            address: user.address,
          });
          setLoading(false);
          return;
        }

        const res = await fetch("/api/protected/users/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          clearAuth();
          sessionStorage.removeItem("auth_user");
          return;
        }

        const data = await res.json();

        if (data?.success && data?.data?.user) {
          const user = data.data.user;
          sessionStorage.setItem("auth_user", JSON.stringify(user));

          setAuth({
            id: user.id,
            name: user.name,
            email: user.email,
            mob_no: user.mob_no,
            role: user.role,
            status: user.status,
            is_profile_complete: user.is_profile_complete,
            address: user.address,
          });
        } else {
          clearAuth();
          sessionStorage.removeItem("auth_user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        clearAuth();
        sessionStorage.removeItem("auth_user");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}