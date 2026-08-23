"use client";

import { createContext, useContext } from "react";

interface MobileMenuContextValue {
  openMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue>({
  openMobileMenu: () => {},
});

export function MobileMenuProvider({
  openMobileMenu,
  children,
}: {
  openMobileMenu: () => void;
  children: React.ReactNode;
}) {
  return (
    <MobileMenuContext.Provider value={{ openMobileMenu }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useOpenMobileMenu() {
  return useContext(MobileMenuContext).openMobileMenu;
}