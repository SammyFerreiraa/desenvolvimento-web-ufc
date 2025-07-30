"use server";

import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { clearAuthCookies, invalidateSession } from "@/common/auth";

export const signOutAction = async () => {
   const cookie = await cookies();
   const refreshToken = cookie.get("refreshToken");

   if (refreshToken) {
      await invalidateSession(refreshToken.value);
   }

   await clearAuthCookies();

   redirect("/login", RedirectType.replace);
};
