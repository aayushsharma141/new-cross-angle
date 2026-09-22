const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\aayus\\.gemini\\antigravity-ide\\brain\\09a170c3-49c6-4d63-8f76-b8f4b501f51e\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
        const data = JSON.parse(line);
        if (data.type === "USER_INPUT" && data.content.includes("Phase 4")) {
            fs.writeFileSync('C:\\Users\\aayus\\Desktop\\main\\user_request_dump.txt', data.content);
        }
    } catch(e) {}
  }
}

processLineByLine();
