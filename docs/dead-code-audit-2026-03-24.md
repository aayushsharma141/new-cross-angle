# Dead Code Audit - 2026-03-24

## Scope

- Current build entry: `index.html` -> `apps/web/src/main.tsx`
- Current build command: `npm run build` from repo root (`vite build && node apps/web/scripts/copy-indexes.js`)
- Build config traced from: `package.json`, `vite.config.ts`, `tsconfig.json`, `apps/web/package.json`
- Reachability method:
  - Traced static and lazy imports from `apps/web/src/main.tsx` and `apps/web/src/App.tsx`
  - Resolved `@/` and `@repo/types` aliases
  - Verified public and asset references with repo-wide searches
  - Cross-checked dead exports against the checked-in `apps/web/knip-results.txt` report, filtered to files that still exist

## Safe To Delete Now

### `apps/web/src`

- `apps/web/src/addons/calculators/components/data/lead-scoring.ts`
- `apps/web/src/addons/calculators/components/data/mock-leads.ts`
- `apps/web/src/assets/hero-interior.jpg`
- `apps/web/src/assets/logo-full.jpeg`
- `apps/web/src/assets/logo-icon.jpeg`
- `apps/web/src/components/WaterRippleEffect.tsx`
- `apps/web/src/components/services/ScrollCarousel.tsx`

### `apps/web`

- `apps/web/dist/` (entire directory)
- `apps/web/dist-demo-CAI.zip`
- `apps/web/build-log.txt`
- `apps/web/build-output.log`
- `apps/web/build.log`
- `apps/web/build_debug.txt`
- `apps/web/build_err.txt`
- `apps/web/build_log.txt`
- `apps/web/build_output.log`
- `apps/web/eslint-results.txt`
- `apps/web/eslint.json`
- `apps/web/eslint_errors.json`
- `apps/web/eslint_errors.txt`
- `apps/web/final-lint.json`
- `apps/web/knip-results.txt`
- `apps/web/lint-errors-final.txt`
- `apps/web/lint-errors-new.json`
- `apps/web/lint-errors-new.txt`
- `apps/web/lint-errors.txt`
- `apps/web/lint-errors2.txt`
- `apps/web/lint-output.json`
- `apps/web/lint_errors.txt`
- `apps/web/lint_output.txt`
- `apps/web/lint_results.json`
- `apps/web/lint_results.txt`
- `apps/web/parsed-final-lint.txt`
- `apps/web/seed_output.log`
- `apps/web/tsc-output.log`
- `apps/web/tsconfig.app.tsbuildinfo`
- `apps/web/tsconfig.node.tsbuildinfo`
- `apps/web/tsc_errors.log`
- `apps/web/tsc_errors_2.log`
- `apps/web/ts_errors.log`
- `apps/web/ts_errors.txt`
- `apps/web/ts_errors2.txt`
- `apps/web/vite.config.ts.timestamp-1773904204146-d70c6ee3db0628.mjs`

### Repo Root

- `dist/` (entire directory)
- `audit_results.json`
- `diff.txt`
- `File-Name-Size.txt`
- `supabase_push_error.txt`
- `tmp_audit_report.txt`
- `tmp_audit_stage1.txt`
- `ts_errors.txt`
- `ts_errors3.txt`
- `ts_errors4.txt`
- `ts_errors5.txt`
- `ts_errors6.txt`
- `ts_errors_plain.txt`
- `ts_errors_plain2.txt`

## Safe Exports To Remove

### Exports In Orphaned Files

- `apps/web/src/addons/calculators/components/data/lead-scoring.ts`: `scoreLead`
- `apps/web/src/addons/calculators/components/data/mock-leads.ts`: `MOCK_LEADS`
- `apps/web/src/components/WaterRippleEffect.tsx`: `default`
- `apps/web/src/components/services/ScrollCarousel.tsx`: `ScrollCarousel`

### Additional Dead Exports In Reachable Files

- `apps/web/src/addons/calculators/components/data/format-utils.ts`: `formatArea`
- `apps/web/src/addons/calculators/components/hooks/useCalculatorStore.ts`: `INITIAL_FORM_DATA`
- `apps/web/src/addons/discovery/core/archetype.ts`: `archetypes`
- `apps/web/src/addons/discovery/core/scoring.ts`: `applySignal`
- `apps/web/src/addons/discovery/flow/session.ts`: `initialSession`
- `apps/web/src/components/admin/ConfirmDialog.tsx`: `default`
- `apps/web/src/components/admin/QuickActions.tsx`: `QuickActions`
- `apps/web/src/components/magicui/animated-beam.tsx`: `default`
- `apps/web/src/components/magicui/dot-pattern.tsx`: `DotPattern`
- `apps/web/src/components/magicui/meteors.tsx`: `default`
- `apps/web/src/components/magicui/neon-gradient-card.tsx`: `default`
- `apps/web/src/components/magicui/retro-grid.tsx`: `default`
- `apps/web/src/components/magicui/sparkles-text.tsx`: `default`
- `apps/web/src/components/magicui/typing-animation.tsx`: `default`
- `apps/web/src/components/ui/alert-dialog.tsx`: `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`
- `apps/web/src/components/ui/badge.tsx`: `badgeVariants`
- `apps/web/src/components/ui/breadcrumb.tsx`: `BreadcrumbEllipsis`
- `apps/web/src/components/ui/card.tsx`: `CardFooter`
- `apps/web/src/components/ui/dialog.tsx`: `DialogPortal`, `DialogOverlay`, `DialogClose`
- `apps/web/src/components/ui/dropdown-menu.tsx`: `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuRadioGroup`
- `apps/web/src/components/ui/form.tsx`: `useFormField`
- `apps/web/src/components/ui/scroll-area.tsx`: `ScrollBar`
- `apps/web/src/components/ui/select.tsx`: `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`
- `apps/web/src/components/ui/sheet.tsx`: `SheetClose`, `SheetOverlay`, `SheetPortal`, `SheetTrigger`
- `apps/web/src/components/ui/skeleton.tsx`: `CardSkeleton`, `TableRowSkeleton`, `BlogSkeleton`, `ServiceSkeleton`, `StatsSkeleton`, `MediaGridSkeleton`, `AvatarSkeleton`, `PageSkeleton`, `default`
- `apps/web/src/components/ui/sonner.tsx`: `toast`
- `apps/web/src/components/ui/table.tsx`: `TableFooter`, `TableCaption`
- `apps/web/src/components/ui/toast.tsx`: `ToastAction`
- `apps/web/src/constants/discovery.ts`: `REFLECTION_PROMPTS`
- `apps/web/src/hooks/use-gsap.ts`: `ScrollTrigger`
- `apps/web/src/hooks/use-toast.ts`: `reducer`, `toast`
- `apps/web/src/hooks/useCountUp.ts`: `useCountUp`
- `apps/web/src/integrations/supabase/types.ts`: `Constants`
- `apps/web/src/lib/auth-validation.ts`: `loginSchema`, `forgotPasswordSchema`, `signupSchema`
- `apps/web/src/lib/utils.ts`: `formatINR`
- `apps/web/src/lib/validations.ts`: `blogPostSchema`, `serviceFeatureSchema`, `processStepSchema`, `faqItemSchema`, `serviceSchema`, `portfolioSchema`, `leadSchema`, `siteContentSchema`, `generateSlug`, `validateSlugUniqueness`

### Additional Dead Exported Types

- `apps/web/src/addons/calculators/components/data/pricing-config.ts`: `ServiceDef`, `AddonDef`
- `apps/web/src/addons/calculators/components/data/types.ts`: `TimelineOption`, `BudgetTier`, `LeadRecord`
- `apps/web/src/addons/discovery/components/DiscoveryAddon.tsx`: `DiscoveryAddonProps`
- `apps/web/src/addons/discovery/components/DiscoveryEngine.tsx`: `DiscoveryEngineProps`
- `apps/web/src/addons/discovery/flow/session.ts`: `SessionState`
- `apps/web/src/addons/discovery/index.ts`: `DiscoveryAddonProps`, `DiscoveryConfig`, `AestheticScores`, `UserSignals`, `AIAestheticResult`
- `apps/web/src/components/gallery/GalleryMasonryGrid.tsx`: `GalleryItem`
- `apps/web/src/components/magicui/shimmer-button.tsx`: `ShimmerButtonProps`
- `apps/web/src/components/SchemaMarkup.tsx`: `SchemaType`
- `apps/web/src/components/ui/badge.tsx`: `BadgeProps`
- `apps/web/src/components/ui/button.tsx`: `ButtonProps`
- `apps/web/src/components/ui/calendar.tsx`: `CalendarProps`
- `apps/web/src/components/ui/carousel.tsx`: `CarouselApi`
- `apps/web/src/components/ui/image.tsx`: `ImageProps`
- `apps/web/src/components/ui/textarea.tsx`: `TextareaProps`
- `apps/web/src/config/site-content.ts`: `ServiceCategory`, `ServiceDetail`
- `apps/web/src/integrations/supabase/types.ts`: `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, `CompositeTypes`
- `apps/web/src/lib/api.ts`: `SupabaseItem`, `ServiceDetail`
- `apps/web/src/lib/auth-validation.ts`: `LoginFormData`, `PasswordFormData`, `ChangePasswordFormData`, `ForgotPasswordFormData`, `SignupFormData`
- `apps/web/src/lib/validations.ts`: `BlogPostFormData`, `ServiceFormData`, `PortfolioFormData`, `LeadStatus`, `LeadFormData`, `SiteContentFormData`
- `apps/web/src/pages/admin/AdminPortfolio.tsx`: `Project`, `Category`, `ProjectWithCategory`
- `apps/web/src/types/discovery.ts`: `LightOption`

## Not Included In The Safe List

These look unused by the current build, but I did not mark them "safe to delete" because they may be intentional reference or template material:

- `apps/web/crossangle-cms/`
- `apps/web/my-project/`
- `tmp_react_bits/`
- `aesthetic-compass-ref/`

## Non-Delete Cleanup Notes

These are dead-code smells, but they are config/dependency cleanup rather than file deletion:

- Root `vite.config.ts` and `tsconfig.json` still define `@repo/ui` and `@repo/utils` aliases even though those package directories do not exist in the current workspace.
- `apps/web/package.json` still declares `@repo/ui` and `@repo/utils`.
- Root `package.json` still has `dev:admin`, but there is no `apps/admin` workspace in the current tree.
