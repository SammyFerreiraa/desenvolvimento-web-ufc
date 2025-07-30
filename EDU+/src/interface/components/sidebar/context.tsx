"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ISidebarContextType = {
   isOpen: boolean;
   isMobile: boolean;
   toggleSidebar: () => void;
   closeSidebar: () => void;
   openSidebar: () => void;
};

const SidebarContext = createContext<ISidebarContextType | undefined>(undefined);

const SIDEBAR_COOKIE_NAME = "sidebarOpen";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const getCookieValue = (name: string): string | null => {
   if (typeof document === "undefined") return null;
   const value = `; ${document.cookie}`;
   const parts = value.split(`; ${name}=`);
   if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
   return null;
};

const setSidebarCookie = (value: string) => {
   if (typeof document === "undefined") return;
   document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const SidebarProvider = ({ children, defaultOpen = true }: { children: ReactNode; defaultOpen?: boolean }) => {
   const [isOpen, setIsOpen] = useState(defaultOpen);
   const [isMobile, setIsMobile] = useState(false);
   const [isInitialized, setIsInitialized] = useState(false);

   useEffect(() => {
      if (isInitialized) {
         setSidebarCookie(isOpen.toString());
      }
   }, [isOpen, isInitialized]);

   useEffect(() => {
      const checkIfMobile = () => {
         const mobile = window.innerWidth < 768;
         setIsMobile(mobile);

         if (!isInitialized) {
            setIsInitialized(true);
            if (mobile) {
               setIsOpen(false);
            } else {
               const savedState = getCookieValue(SIDEBAR_COOKIE_NAME);
               setIsOpen(savedState !== null ? savedState === "true" : defaultOpen);
            }
         }
      };

      checkIfMobile();
      window.addEventListener("resize", checkIfMobile);
      return () => window.removeEventListener("resize", checkIfMobile);
   }, [defaultOpen, isInitialized]);

   const toggleSidebar = useCallback(() => {
      setIsOpen((prev) => {
         const newValue = !prev;
         setSidebarCookie(newValue.toString());
         return newValue;
      });
   }, []);

   const closeSidebar = useCallback(() => {
      setIsOpen(false);
      setSidebarCookie("false");
   }, []);

   const openSidebar = useCallback(() => {
      setIsOpen(true);
      setSidebarCookie("true");
   }, []);

   if (!isInitialized) {
      return null;
   }

   return (
      <SidebarContext.Provider
         value={{
            isOpen,
            isMobile,
            toggleSidebar,
            closeSidebar,
            openSidebar
         }}
      >
         {children}
      </SidebarContext.Provider>
   );
};

export const useSidebar = () => {
   const context = useContext(SidebarContext);
   if (context === undefined) {
      throw new Error("useSidebar must be used within a SidebarProvider");
   }
   return context;
};
