import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getGPTResponse() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, who are you?' }],
    });

    console.log(response.choices[0].message.content);

  } catch (error) {
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.error('❌ API quota exceeded. Please check your plan and billing at https://platform.openai.com/account/billing');
    } else {
      console.error('❌ OpenAI API error:', error.message);
    }
  }
}

getGPTResponse();
