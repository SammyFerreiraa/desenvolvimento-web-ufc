import { EditarQuestaoPage } from "@/interface/features/questoes/components/editar-questao-page";

type Props = {
   params: Promise<{ id: string }>;
};

export default async function EditarQuestaoPageWrapper({ params }: Props) {
   const { id } = await params;
   return <EditarQuestaoPage questaoId={id} />;
}
