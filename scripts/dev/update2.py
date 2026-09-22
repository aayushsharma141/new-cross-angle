import os
import re

file_path = r'c:\Users\aayus\Desktop\main\apps\web\src\addons\discovery\components\DiscoveryEngine.tsx'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Let's see if WorkspacePanel is already there but missed the bottom part?
# Wait, the first replacement replaced the layout start.
# Let's fix the bottom part.

start_marker = "            {/* ✧・ﾟ LUXURY PROGRESS SIDEBAR (260px) ✧・ﾟ */}"
if start_marker not in content:
    print("Start marker not found")

# Try to find it without exact symbols
# We want to replace from DiscoveryProgressSidebar to the end of the main tag.
# Actually, the file has a main tag that closes right before the final </div>.
pattern = r'(\s*)\{/\*.*?LUXURY PROGRESS SIDEBAR.*?\*/\}.*?</main>'

replacement = r'''\1{isQuizStage ? (
\1    <WorkspacePanel sidebar={sidebarContent} mainContent={mainContent} dossierContent={dossierContent} />
\1) : (
\1    mainContent
\1)}'''

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
print(f"Replaced {count} times")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
