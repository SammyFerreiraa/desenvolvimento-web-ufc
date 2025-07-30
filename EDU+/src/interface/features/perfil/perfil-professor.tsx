"use client";

import { useEffect, useState } from "react";
import { Edit, Save, UserCircle, X } from "lucide-react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { perfilApi, type UpdateProfileData, type UserWithProfile } from "@/services/perfil-api";

export function PerfilProfessor() {
   const [userData, setUserData] = useState<UserWithProfile | null>(null);
   const [loading, setLoading] = useState(true);
   const [editing, setEditing] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [formData, setFormData] = useState({
      name: "",
      especialidade: "",
      biografia: ""
   });

   useEffect(() => {
      void loadUserData();
   }, []);

   const loadUserData = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await perfilApi.getPerfil();
         setUserData(response.user);
         setFormData({
            name: response.user.name || "",
            especialidade: response.user.profile?.especialidade || "",
            biografia: response.user.profile?.biografia || ""
         });
      } catch (err) {
         setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
      } finally {
         setLoading(false);
      }
   };

   const handleSave = async () => {
      try {
         setSaving(true);
         setError(null);

         const updateData: UpdateProfileData = {
            name: formData.name,
            especialidade: formData.especialidade,
            biografia: formData.biografia
         };

         const response = await perfilApi.updatePerfil(updateData);
         setUserData(response.user);
         setEditing(false);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Erro ao salvar perfil");
      } finally {
         setSaving(false);
      }
   };

   const handleCancel = () => {
      if (userData) {
         setFormData({
            name: userData.name || "",
            especialidade: userData.profile?.especialidade || "",
            biografia: userData.profile?.biografia || ""
         });
      }
      setEditing(false);
      setError(null);
   };

   if (loading) {
      return (
         <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-emerald-600"></div>
         </div>
      );
   }

   if (!userData) {
      return <div className="text-center text-red-600">Erro ao carregar dados do perfil</div>;
   }

   return (
      <div className="container mx-auto space-y-6 py-6">
         <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            {!editing && (
               <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Perfil
               </Button>
            )}
         </div>

         {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
               <p className="text-red-800">{error}</p>
            </div>
         )}

         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Card do Avatar e Informações Básicas */}
            <Card className="lg:col-span-1">
               <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                     {userData.image ? (
                        <img
                           src={userData.image}
                           alt="Avatar"
                           className="h-24 w-24 rounded-full border-4 border-emerald-500 object-cover"
                        />
                     ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-100">
                           <img src="/avatar-default.svg" alt="Avatar padrão" className="h-20 w-20" />
                        </div>
                     )}
                  </div>
                  <CardTitle className="text-xl">{userData.name || "Nome não informado"}</CardTitle>
                  <Badge className="bg-[#58876A] text-white">Professor</Badge>
               </CardHeader>
               <CardContent className="space-y-3">
                  <div>
                     <Label className="text-sm font-medium text-gray-600">Email</Label>
                     <p className="text-gray-900">{userData.email}</p>
                  </div>
                  <div>
                     <Label className="text-sm font-medium text-gray-600">ID do Usuário</Label>
                     <p className="font-mono text-sm text-gray-500">{userData.id}</p>
                  </div>
               </CardContent>
            </Card>

            {/* Card das Informações Detalhadas */}
            <Card className="lg:col-span-2">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <UserCircle className="h-5 w-5" />
                     Informações Pessoais
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  {editing ? (
                     <>
                        {/* Modo de Edição */}
                        <div>
                           <Label htmlFor="name">Nome Completo</Label>
                           <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Digite seu nome completo"
                           />
                        </div>

                        <div>
                           <Label htmlFor="especialidade">Especialidade</Label>
                           <Input
                              id="especialidade"
                              value={formData.especialidade}
                              onChange={(e) => setFormData((prev) => ({ ...prev, especialidade: e.target.value }))}
                              placeholder="Ex: Matemática, Português, História..."
                           />
                        </div>

                        <div>
                           <Label htmlFor="biografia">Biografia</Label>
                           <textarea
                              id="biografia"
                              value={formData.biografia}
                              onChange={(e) => setFormData((prev) => ({ ...prev, biografia: e.target.value }))}
                              placeholder="Fale um pouco sobre você, sua experiência e metodologia..."
                              className="min-h-[120px] w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                           />
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-3 pt-4">
                           <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                              <Save className="h-4 w-4" />
                              {saving ? "Salvando..." : "Salvar"}
                           </Button>
                           <Button
                              variant="outline"
                              onClick={handleCancel}
                              disabled={saving}
                              className="flex items-center gap-2"
                           >
                              <X className="h-4 w-4" />
                              Cancelar
                           </Button>
                        </div>
                     </>
                  ) : (
                     <>
                        {/* Modo de Visualização */}
                        <div>
                           <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
                           <p className="text-gray-900">{userData.name || "Não informado"}</p>
                        </div>

                        <div>
                           <Label className="text-sm font-medium text-gray-600">Especialidade</Label>
                           <p className="text-gray-900">{userData.profile?.especialidade || "Não informado"}</p>
                        </div>

                        <div>
                           <Label className="text-sm font-medium text-gray-600">Biografia</Label>
                           <p className="leading-relaxed text-gray-900">
                              {userData.profile?.biografia || "Nenhuma biografia adicionada ainda."}
                           </p>
                        </div>
                     </>
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
