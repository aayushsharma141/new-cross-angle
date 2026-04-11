import re

with open(r'c:\Users\aayus\Desktop\main\apps\web\src\App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
skip_query_client = False
skip_posthog = False
for line in lines:
    # Skip imports
    if line.startswith('import { AuthProvider }'): continue
    if line.startswith('import { AdminProvider }'): continue
    if line.startswith('import { SystemProvider }'): continue
    if line.startswith('import { TooltipProvider }'): continue
    if 'QueryClient' in line and '@tanstack/react-query' in line: continue
    if line.startswith('import { HelmetProvider }'): continue
    if line.startswith('import { LanguageProvider }'): continue
    if line.startswith('import { ThemeProvider }'): continue
    if line.startswith('import { CookieConsentProvider }'): continue
    if line.startswith("import { PostHogProvider }"): continue

    # Add core providers import
    if line.startswith('import { SmoothScroll }'):
        out.append(line)
        out.append('import { CoreProviders } from "./providers/CoreProviders";\n')
        continue

    # Skip query client instantiation
    if line.startswith('const queryClient = new QueryClient('):
        skip_query_client = True
        continue
    if skip_query_client:
        if line.startswith('});'):
            skip_query_client = False
        continue

    out.append(line)

text = ''.join(out)

# Replace top tags
target1 = '''    <HelmetProvider>
      <SchemaMarkup'''
rep1 = '''    <CoreProviders>
      <SchemaMarkup'''
text = text.replace(target1, rep1)

# Keep SchemaMarkup intact, but replace the query client provider down to PostHogProvider
target2 = '''      />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CookieConsentProvider>
            <DeferredExperienceEnhancements />
            <TooltipProvider>
              <AuthProvider>
                <SystemProvider>
                  <AdminProvider>
                    <LanguageProvider>
                      <PostHogProvider 
                        apiKey={import.meta.env.VITE_POSTHOG_KEY}
                        options={{
                          api_host: "https://app.posthog.com",
                          person_profiles: 'identified_only',
                          capture_pageview: true,
                        }}
                      >

                        <SmoothScroll>'''
rep2 = '''      />
      <DeferredExperienceEnhancements />
      <SmoothScroll>'''
text = text.replace(target2, rep2)


target3 = '''                        </SmoothScroll>
                      </PostHogProvider>
                    </LanguageProvider>
                  </AdminProvider>
                </SystemProvider>
              </AuthProvider>
            </TooltipProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>'''
rep3 = '''      </SmoothScroll>
    </CoreProviders>'''

text = text.replace(target3, rep3)

with open(r'c:\Users\aayus\Desktop\main\apps\web\src\App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("done")
