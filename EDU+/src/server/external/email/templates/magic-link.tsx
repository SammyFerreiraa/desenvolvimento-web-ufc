import { env } from "@/config/env";
import {
   Body,
   Button,
   Container,
   Head,
   Heading,
   Html,
   Img,
   Preview,
   render,
   Section,
   Tailwind,
   Text
} from "@react-email/components";
import { sendEmail } from "../config";

type IMagicLinkEmailProps = {
   token: string;
};

const baseUrl = env.NEXT_PUBLIC_API_URL;

const MagicLinkEmail = ({ token }: IMagicLinkEmailProps) => (
   <Html>
      <Head>
         <title>Acesso Seguro à Plataforma</title>
      </Head>
      <Tailwind>
         <Body className="bg-gray-50 font-sans">
            <Preview>Seu acesso seguro à plataforma</Preview>
            <Container className="mx-auto my-0 max-w-[600px] p-0">
               <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="bg-blue-500 p-6 text-center">
                     <Img
                        src={`${baseUrl}/static/logo-white.png`}
                        width="120"
                        height="40"
                        alt="Logo"
                        className="mx-auto h-10 w-auto"
                     />
                  </div>

                  <div className="px-8 py-10">
                     <Heading className="mb-4 text-center text-2xl font-bold text-gray-900">Seu Acesso Seguro</Heading>

                     <Text className="mb-6 text-center text-base text-gray-600">
                        Clique no botão abaixo para acessar sua conta de forma segura.
                     </Text>

                     <Section className="my-8 text-center">
                        <Button
                           href={`${baseUrl}/api/auth/verify-token?token=${token}`}
                           className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-center text-sm font-semibold text-white no-underline transition-colors hover:bg-blue-600"
                        >
                           Acessar Minha Conta
                        </Button>
                     </Section>

                     <div className="my-6 border-t border-gray-200"></div>

                     <div className="mb-6 rounded-lg bg-blue-50 p-4">
                        <Text className="mb-2 text-sm font-medium text-blue-800">Importante:</Text>
                        <ul className="ml-5 list-disc space-y-1 text-sm text-blue-700">
                           <li>Este link é válido por apenas 5 minutos</li>
                           <li>Não compartilhe este e-mail com ninguém</li>
                           <li>Se não foi você que solicitou, ignore esta mensagem</li>
                        </ul>
                     </div>

                     <Text className="mb-4 text-sm text-gray-500">
                        Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                     </Text>

                     <div className="mb-8 overflow-hidden rounded-md bg-gray-100 p-3">
                        <Text className="font-mono text-sm break-all text-blue-600">
                           {`${baseUrl}/api/auth/verify-token?token=${token}`}
                        </Text>
                     </div>

                     <Text className="text-center text-xs text-gray-400">
                        Esta é uma mensagem automática, por favor não responda este e-mail.
                     </Text>
                  </div>

                  <div className="bg-gray-50 px-8 py-6 text-center">
                     <Text className="text-xs text-gray-500">
                        {new Date().getFullYear()} Nome da Empresa. Todos os direitos reservados.
                     </Text>
                     <Text className="mt-2 text-xs text-gray-400">Endereço da Empresa, Cidade - Estado, CEP</Text>
                  </div>
               </div>
            </Container>
         </Body>
      </Tailwind>
   </Html>
);

MagicLinkEmail.PreviewProps = {
   token: "tt226-5398x-1234a-5678b"
};

export const sendMagicLinkEmail = async ({ email, token }: { email: string; token: string }) => {
   const html = await render(<MagicLinkEmail token={token} />);
   await sendEmail({
      to: email,
      subject: "Acesso Seguro à Plataforma",
      html
   });
};

export default MagicLinkEmail;
