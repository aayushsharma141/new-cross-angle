import re

with open(r'c:\Users\aayus\Desktop\main\supabase\functions\retry-webhooks\index.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Add import
import_statement = 'import { createClient } from "https://esm.sh/@supabase/supabase-js@2";\nimport { signWebhookPayload } from "../_lib/security.ts";'
text = text.replace('import { createClient } from "https://esm.sh/@supabase/supabase-js@2";', import_statement)

# Replace fetch
pattern = re.compile(r'                const response = await fetch\(failure\.webhook_url, \{\s*method: \'POST\',\s*headers: \{ \'Content-Type\': \'application/json\' \},\s*body: JSON\.stringify\(failure\.payload\),\s*\}\);')

replacement = '''                const payloadStr = JSON.stringify(failure.payload);
                const signature = await signWebhookPayload(payloadStr);
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (signature) {
                    headers['X-CrossAngle-Signature'] = signature;
                }

                const response = await fetch(failure.webhook_url, {
                    method: 'POST',
                    headers,
                    body: payloadStr,
                });'''

text, n = pattern.subn(replacement, text)
print(f'Replaced fetch {n} times')

with open(r'c:\Users\aayus\Desktop\main\supabase\functions\retry-webhooks\index.ts', 'w', encoding='utf-8') as f:
    f.write(text)
