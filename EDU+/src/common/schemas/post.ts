import { z } from "../../config/zod-config";

export const createPostSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
   content: z.string().min(1, "Conteúdo é obrigatório").max(1000, "Conteúdo deve ter no máximo 1000 caracteres")
});

export const updatePostSchema = z.object({
   id: z.number(),
   name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
   content: z.string().min(1, "Conteúdo é obrigatório").max(1000, "Conteúdo deve ter no máximo 1000 caracteres")
});

export const createCommentSchema = z.object({
   text: z.string().min(1, "Comentário é obrigatório").max(500, "Comentário deve ter no máximo 500 caracteres"),
   postId: z.number()
});

export const getPostsSchema = z.object({
   limit: z.number().min(1).max(100).optional().default(10),
   offset: z.number().min(0).optional().default(0),
   search: z.string().optional()
});

export type ICreatePost = z.infer<typeof createPostSchema>;
export type IUpdatePost = z.infer<typeof updatePostSchema>;
export type ICreateComment = z.infer<typeof createCommentSchema>;
export type IGetPosts = z.infer<typeof getPostsSchema>;
