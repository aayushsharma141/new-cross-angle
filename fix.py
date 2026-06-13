import re

with open(r'c:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

if 'ChevronRight' not in code:
    code = re.sub(r'import\s*\{\s*Settings\s*\}\s*from\s*\"lucide-react\";', 'import { Settings, ChevronRight } from \"lucide-react\";', code)

pattern = re.compile(
    r'<AdminPageHeader moduleName=\"CMS\" tabName=\"Media Library\" />\s*<div className=\"mt-8 mb-6 flex flex-wrap items-center justify-between gap-4\">.*?<FolderBreadcrumbs.*?\/>\s*(<div className=\"flex items-center gap-3\">.*?<\/div>)\s*<\/div>',
    re.DOTALL
)

match = pattern.search(code)
if match:
    action_div = match.group(1)
    
    code = code.replace('<MediaGrid\n                    files={filteredFiles}', '<MediaGrid\n                    hideEmptyState={folders.length > 0}\n                    files={filteredFiles}')
    
    new_header = f'''<AdminPageHeader 
                moduleName="CMS" 
                tabName={{
                    <span className="flex items-center gap-1.5">
                        <span 
                            className={{`hover:text-[hsl(var(--admin-text))] transition-colors cursor-pointer ${{!currentFolder ? "font-semibold" : "font-normal opacity-70"}}`}}
                            onClick={{() => handleNavigate(null)}}
                        >
                            Media Library
                        </span>
                        {{folderPath.map((f, index) => {{
                            const isLast = index === folderPath.length - 1;
                            return (
                                <span key={{f.id}} className="flex items-center gap-1.5">
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                    <span 
                                        className={{`hover:text-[hsl(var(--admin-text))] transition-colors cursor-pointer ${{isLast ? "font-semibold" : "font-normal opacity-70"}}`}}
                                        onClick={{() => handleNavigate(f)}}
                                    >
                                        {{f.name}}
                                    </span>
                                </span>
                            );
                        }})}}
                    </span>
                }}
                actions={{
                    {action_div}
                }}
            />'''
            
    code = code[:match.start()] + new_header + code[match.end():]
    
    with open(r'c:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print('SUCCESS')
else:
    print('COULD NOT MATCH')
