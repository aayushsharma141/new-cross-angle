import re

with open(r'c:\Users\aayus\Desktop\main\supabase\functions\process-lead\index.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'    const response = await fetch\(webhookUrl, \{\s*method: \"POST\",\s*headers: \{ \"Content-Type\": \"application/json\" \},\s*body: JSON\.stringify\(\{[\s\S]*?\}\),\s*\}\);')

replacement = '''    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: payloadStr,
    });'''

text, n = pattern.subn(replacement, text)
print(f'Replaced {n} times')

with open(r'c:\Users\aayus\Desktop\main\supabase\functions\process-lead\index.ts', 'w', encoding='utf-8') as f:
    f.write(text)
