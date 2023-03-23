import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { Client, middleware, WebhookEvent, TextMessage } from '@line/bot-sdk';
import { generateResponse } from './generateResponse';

const config: any = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
};

const app = express();
app.use(middleware(config));
app.use(bodyParser.json());

const client = new Client(config);

app.post('/webhook', async (req, res) => {
  const events = req.body.events as WebhookEvent[];

  try {
    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          const message = event.message as TextMessage;
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: await generateResponse(message.text),
          });
        }
      })
    );
    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
