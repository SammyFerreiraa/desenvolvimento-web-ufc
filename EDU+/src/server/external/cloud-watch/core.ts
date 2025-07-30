import { env } from "@/config/env";
import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

const cloudwatchClient = new CloudWatchLogsClient({
   region: env.AWS_CLOUDWATCH_REGION,
   credentials: {
      accessKeyId: env.AWS_CLOUDWATCH_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_CLOUDWATCH_SECRET_ACCESS_KEY
   }
});

const logGroupName = env.AWS_CLOUDWATCH_LOG_GROUP_NAME;

const initializeLogStream = async ({ logStreamName }: { logStreamName: string }) => {
   try {
      await cloudwatchClient.send(
         new CreateLogStreamCommand({
            logGroupName,
            logStreamName
         })
      );
   } catch (err) {
      console.error("Erro ao criar log stream:", err);
      return;
   }
};

let sequenceToken: string | undefined;

const sendLog = async ({ level, title, data, uid }: { level: string; title: string; data?: unknown; uid?: string }) => {
   const timestamp = Date.now();
   const logEvent = {
      timestamp,
      message: JSON.stringify({ level, title, data, uid })
   };

   const logStreamName = `user-${uid}`;

   try {
      await initializeLogStream({ logStreamName });
      const response = await cloudwatchClient.send(
         new PutLogEventsCommand({
            logGroupName,
            logStreamName,
            logEvents: [logEvent],
            sequenceToken
         })
      );
      sequenceToken = response.nextSequenceToken;
   } catch (err) {
      console.error("Erro ao enviar log para CloudWatch:", err);
   }
};

export const cloudwatch = {
   sendLog
};
