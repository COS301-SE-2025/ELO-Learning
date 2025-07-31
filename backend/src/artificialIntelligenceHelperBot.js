import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // or paste your key here directly (not recommended)
});

async function getGPTResponse() {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // or "gpt-3.5-turbo"
    messages: [{ role: 'user', content: 'Hello, who are you?' }],
  });

  console.log(response.choices[0].message.content);
}

getGPTResponse();
