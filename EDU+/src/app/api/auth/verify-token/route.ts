import { isBefore } from "date-fns";
import { redirect } from "next/navigation";
import { createTokens, setAuthCookies, type SessionUser } from "@/common/auth";
import { getClientIP, getUserAgent } from "@/server/auth/utils";
import { prisma } from "@/server/config/prisma";

export async function GET(req: Request) {
   const { searchParams } = new URL(req.url);
   const token = searchParams.get("token");

   if (!token) return redirect("/login/invalid-token");

   const record = await prisma.verificationCode.findFirst({
      where: { code: token, used: false },
      include: { user: true }
   });

   if (!record) {
      return redirect("/login/invalid-token");
   }

   if (isBefore(record.expiresAt, new Date())) {
      return redirect("/login/invalid-token");
   }

   await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true }
   });

   const user: SessionUser = {
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
      role: record.user.role,
      image: record.user.image
   };

   const ipAddress = getClientIP(req);
   const userAgent = getUserAgent(req);

   const { accessToken, refreshToken } = await createTokens(user, { ipAddress, userAgent });
   await setAuthCookies(accessToken, refreshToken);

   return redirect("/");
}
