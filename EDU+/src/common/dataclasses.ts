import type { Prisma } from "@prisma/client";

export interface ITokenPayload {
   uid: number;
   name: string | null;
   email: string | null;
   exp: number;
   iat: number;
}

export type IPostWithComments = Prisma.PostGetPayload<{
   include: {
      comments: true;
   };
}>;

export type IUser = Prisma.UserGetPayload<{
   include: {
      Post: true;
   };
}>;
