"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ResponsiveNavbar from "@/components/common/responsive-navbar";

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/admin") || pathname.startsWith("/super-admin");
  return (
    <>
      {!hideNavbar && <ResponsiveNavbar />}
      {children}
    </>
  );
}
