import { ChatGPTAPI } from 'chatgpt';
import readline from 'readline';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function sendMessageAndWait(api, message) {
  const res = await api.sendMessage(message);
  return res.text;
}

async function analyzeTextFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function run() {
  const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let analyzedText = '';

  while (true) {
    const question = await new Promise((resolve) => {
      rl.question('Enter a question (or type "exit" to quit): ', (answer) => {
        resolve(answer);
      });
    });

    if (question.toLowerCase() === 'exit') {
      console.log('Exiting the conversation.');
      break;
    }

    if (question.toLowerCase().startsWith('analyze')) {
      const filePath = question.slice('analyze'.length).trim();
      try {
        analyzedText = await analyzeTextFile(filePath);
        console.log('Text analyzed successfully.');
      } catch (error) {
        console.error('Error analyzing text file:', error);
      }
    } else if (analyzedText) {
      const fullQuestion = `${analyzedText} ${question}`;
      const answer = await sendMessageAndWait(api, fullQuestion);
      console.log(answer);
    } else {
      const answer = await sendMessageAndWait(api, question);
      console.log(answer);
    }
  }

  rl.close();
}

run();
