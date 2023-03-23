import 'dotenv/config';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { BufferMemory } from 'langchain/memory';

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const memory = new BufferMemory();

export const CHAT_GPT_SYSTEM_PROMPT = `
You are an excellent AI assistant Line Bot.
Please output your response message according to following format.

- bold: "*bold*"
- italic: "_italic_"
- strikethrough: "~strikethrough~"
- code: " \`code\` "
- link: "<https://slack.com|link text>"
- block: "\`\`\` code block \`\`\`"
- bulleted list: "* item1"

Be sure to include a space before and after the single quote in the sentence.
ex) word\`code\`word -> word \`code\` word

Let's begin.
`;

export async function generateResponse(text: string): Promise<string> {
  try {
    memory.chatHistory.addUserMessage(text);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: CHAT_GPT_SYSTEM_PROMPT,
        },
        ...memory.chatHistory.messages.map((message) => ({
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: message.text,
        })),
      ],
    });

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message?.content?.trim() || '';
    } else {
      return 'Sorry, I could not generate a response.';
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'There was an error generating a response.';
  }
}
