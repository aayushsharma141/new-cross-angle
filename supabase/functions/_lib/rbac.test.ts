import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { hasAnyCmsRole } from "./rbac.ts";

// hasAnyCmsRole decides verifyCmsEditor, which guards imagekit-upload. It must
// match public.is_cms_editor() (super_admin, admin, editor), the rule on the
// DAM upload RPCs, or an editor's upload passes the RPC and fails at storage.

Deno.test("hasAnyCmsRole admits each CMS role", () => {
  for (const role of ["super_admin", "admin", "editor"]) {
    assertEquals(hasAnyCmsRole([{ role }]), true, role);
  }
});

Deno.test("hasAnyCmsRole refuses viewers, unknown roles and no roles", () => {
  assertEquals(hasAnyCmsRole([{ role: "viewer" }]), false);
  assertEquals(hasAnyCmsRole([{ role: "user" }]), false);
  assertEquals(hasAnyCmsRole([{ role: null }]), false);
  assertEquals(hasAnyCmsRole([]), false);
  assertEquals(hasAnyCmsRole(null), false);
});

Deno.test("hasAnyCmsRole admits a user holding several roles if any grants CMS", () => {
  assertEquals(hasAnyCmsRole([{ role: "viewer" }, { role: "editor" }]), true);
});
