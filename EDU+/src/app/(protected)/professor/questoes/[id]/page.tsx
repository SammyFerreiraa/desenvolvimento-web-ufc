import { VisualizarQuestaoPage } from "@/interface/features/questoes";

type Props = {
   params: Promise<{ id: string }>;
};

export default async function VisualizarQuestaoPageWrapper({ params }: Props) {
   const { id } = await params;
   return <VisualizarQuestaoPage questaoId={id} />;
}
