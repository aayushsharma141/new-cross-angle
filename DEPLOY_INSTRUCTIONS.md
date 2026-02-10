# Free Deployment with Surge.sh

Surge.sh is a free static hosting provider perfect for this project.

## Steps to Deploy

1. **Open Terminal** in the `apps/web` directory:
   ```bash
   cd apps/web
   ```

2. **Run Deployment Command**:
   ```bash
   npx surge dist
   ```

3. **Login / Signup**:
   - It will ask for an **email** and **password**.
   - If you don't have an account, just type your email and a new password to create one instantly.

4. **Select Domain**:
   - It will suggest a random domain (e.g., `sable-sofa.surge.sh`).
   - Press **Enter** to accept it.
   - OR type a custom subdomain (e.g., `cross-angle-admin.surge.sh`) and press Enter.

## Note on Refreshing Pages
I have already created a `200.html` file in your `dist` folder. This ensures that if you refresh the page while on a sub-route (like `/admin/users`), it won't give you a 404 error.
