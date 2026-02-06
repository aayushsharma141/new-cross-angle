
# Fix: Update package.json Scripts for Build Compatibility

## Problem
The build is failing because the root `package.json` is missing the required scripts that Lovable's build system expects.

## Current State
```json
"scripts": {
  "dev:web": "npm run dev --workspace=web",
  "dev:admin": "npm run dev --workspace=admin",
  "build": "npm run build --workspaces"
}
```

## Required Change
Update the `scripts` section to:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview",
  "dev:web": "npm run dev --workspace=web",
  "dev:admin": "npm run dev --workspace=admin"
}
```

## Implementation Steps

### Step 1: Update package.json
Modify the root `package.json` to add the required Vite scripts:
- `dev` - Runs Vite development server
- `build` - Creates production build
- `build:dev` - Creates development build (required by Lovable)
- `preview` - Previews the production build

### Step 2: Fix favicon path in index.html
Change the favicon path from `/apps/web/public/favicon.ico` to `/favicon.ico` since Vite serves files from the public directory automatically.

### Step 3: Add publicDir to vite.config.ts
Ensure Vite knows where to find static assets:
```typescript
publicDir: path.resolve(__dirname, "./apps/web/public"),
```

---

## Technical Details

| File | Change |
|------|--------|
| `package.json` | Add `dev`, `build`, `build:dev`, `preview` scripts |
| `index.html` | Fix favicon path to `/favicon.ico` |
| `vite.config.ts` | Add `publicDir` configuration |

## Expected Result
After these changes, the preview should load successfully showing the Crossangle Interior website.
