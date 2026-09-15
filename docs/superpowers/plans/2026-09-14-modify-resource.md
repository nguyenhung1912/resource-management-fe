# Modify Resource Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive edit-resource modal page that updates metadata and an optional banner image while keeping the original document immutable.

**Architecture:** A dedicated `ModifyResourceModal` owns controlled form state and validation, reusing the existing modal, author, keyword, and image dropzone components. A lazy-loaded `ModifyResourcePage` supplies typed preview data and navigation, while centralized path helpers connect the resource table to the new nested edit route.

**Tech Stack:** React 19, TypeScript 6, React Router v7 Data Mode, Tailwind CSS v4, Lucide React, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-14-modify-resource-design.md`

## Global Constraints

- The original document file is read-only and must never appear in the submit payload.
- Only PNG, JPEG, and WebP banner images up to 5 MB are accepted.
- The flow uses local preview data only and does not add API calls or persistence.
- Route segments and navigation URLs must come from `src/constants/path.ts`.
- The modal must use `fullScreenOnMobile`; only its body scrolls.
- Use semantic Essential design tokens, Lucide icons, accessible labels, focus states, and inline validation feedback.
- TypeScript remains strict with no `any`; type-only imports use `import type`.

---

### Task 1: Add the typed modify-resource form

**Files:**
- Modify: `src/features/resources/types/resource.types.ts`
- Create: `src/features/resources/components/ModifyResourceModal.tsx`
- Create: `src/features/resources/components/__tests__/ModifyResourceModal.test.tsx`

**Interfaces:**
- Consumes: `BaseModal`, `Button`, `Input`, `Label`, `Textarea`, `AuthorInput`, `KeywordInput`, `ResourceFileDropzone`, and `SelectOption<TValue>`.
- Produces: `ModifyResourceInitialValues`, `ModifyResourceFormValues`, `ModifyResourceModalProps`, and `ModifyResourceModal`.

- [ ] **Step 1: Write failing tests for initial state and immutable document behavior**

Create a typed fixture and render the real modal. Assert the dialog is populated with the current name, description, selections, year, authors, and keywords. Assert the document summary contains `bao-cao.pdf`, and that the only file input is labelled `Chọn ảnh banner`, so no document replacement control exists.

```tsx
expect(screen.getByRole('dialog', { name: 'Chỉnh sửa tài nguyên' })).toBeInTheDocument();
expect(screen.getByLabelText(/tên tài nguyên/i)).toHaveValue('Báo cáo AI');
expect(screen.getByText('bao-cao.pdf')).toBeInTheDocument();
expect(screen.getAllByLabelText(/chọn .*ảnh|chọn .*tệp/i)).toHaveLength(1);
expect(screen.getByLabelText('Chọn ảnh banner')).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/resources/components/__tests__/ModifyResourceModal.test.tsx`

Expected: FAIL because `ModifyResourceModal` and its types do not exist.

- [ ] **Step 3: Define modify-resource types**

Add exact contracts:

```ts
export interface ModifyResourceInitialValues {
  id: string;
  documentFileName: string;
  documentFileTypeName: string;
  documentFileSizeBytes: number | null;
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorNames: string[];
  keywords: string[];
}

export interface ModifyResourceFormValues {
  fileName: string;
  fileDescription: string | null;
  fileTypeId: number;
  subMajorCode: string;
  courseCode: string | null;
  yearCompleted: number | null;
  authorNames: string[];
  keywords: string[];
  bannerImage: File | null;
}
```

- [ ] **Step 4: Implement the minimal populated form**

Create `ModifyResourceModal` with state initialized lazily from `resource`. Render a read-only document card using `FileText`, the same metadata controls as upload, and a banner `ResourceFileDropzone` with:

```tsx
accept="image/png,image/jpeg,image/webp"
variant="image"
```

Use `BaseModal` with `fullScreenOnMobile`, `maxWidth="2xl"`, title `Chỉnh sửa tài nguyên`, and form id `modify-resource-form`.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- src/features/resources/components/__tests__/ModifyResourceModal.test.tsx`

Expected: PASS for populated state and immutable document behavior.

- [ ] **Step 6: Write failing tests for validation and normalized submission**

Add separate tests that:

1. Upload `banner.gif` and assert `Ảnh banner phải có định dạng PNG, JPG hoặc WEBP.`
2. Upload an image with `size = 5 * 1024 * 1024 + 1` and assert the 5 MB error.
3. Clear the name, submit, and assert `onSubmit` is not called.
4. Edit valid fields, select a PNG, submit, and assert the exact payload contains metadata plus `bannerImage`, with no `file` or `documentFileName` property.

```tsx
expect(handleSubmit).toHaveBeenCalledWith({
  fileName: 'Đề tài AI cập nhật',
  fileDescription: 'Mô tả mới',
  fileTypeId: 2,
  subMajorCode: 'AI',
  courseCode: 'SWR302',
  yearCompleted: 2025,
  authorNames: ['Nguyễn Văn An'],
  keywords: ['React'],
  bannerImage,
});
```

- [ ] **Step 7: Run the focused test and verify RED**

Run: `npm test -- src/features/resources/components/__tests__/ModifyResourceModal.test.tsx`

Expected: FAIL because banner validation and submit behavior are not implemented.

- [ ] **Step 8: Implement validation and submission**

Validate required name/type/sub-major/authors, maximum name length 255, years from 1900 through the current year, accepted banner MIME types, and the 5 MB limit. Trim name/description and convert select/year values before invoking `onSubmit`. Disable close/submit while `isSubmitting` and render `apiError` as an alert when provided.

- [ ] **Step 9: Run the focused test and verify GREEN**

Run: `npm test -- src/features/resources/components/__tests__/ModifyResourceModal.test.tsx`

Expected: all modify modal tests PASS with no warnings.

- [ ] **Step 10: Commit the form unit**

```bash
git add src/features/resources/types/resource.types.ts src/features/resources/components/ModifyResourceModal.tsx src/features/resources/components/__tests__/ModifyResourceModal.test.tsx
git commit -m "feat: add modify resource form"
```

### Task 2: Add the edit page and centralized route

**Files:**
- Modify: `src/constants/path.ts`
- Modify: `src/routes/domains/resourceRoutes.tsx`
- Create: `src/features/resources/pages/ModifyResourcePage.tsx`
- Modify: `src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

**Interfaces:**
- Consumes: `ModifyResourceModal`, `ModifyResourceInitialValues`, `APP_PATHS.RESOURCES_MANAGER`, `ROUTE_PARAMS.RESOURCE_ID`, and `RouteSuspense` behavior supplied by the parent route tree.
- Produces: `ROUTE_SEGMENTS.RESOURCE_EDIT`, `APP_PATHS.RESOURCE_EDIT(resourceId)`, and the lazy `ModifyResourcePage` route.

- [ ] **Step 1: Write a failing route test**

Create an isolated memory router with `initialEntries: [APP_PATHS.RESOURCE_EDIT('resource-1')]`. Assert the edit dialog appears with preview metadata, then click `Hủy` and assert the pathname becomes `APP_PATHS.RESOURCES_MANAGER`.

```tsx
expect(await screen.findByRole('dialog', { name: 'Chỉnh sửa tài nguyên' })).toBeInTheDocument();
expect(screen.getByText('Báo cáo thực tập_Final.pdf')).toBeInTheDocument();
fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
await waitFor(() => expect(router.state.location.pathname).toBe(APP_PATHS.RESOURCES_MANAGER));
```

- [ ] **Step 2: Run the route test and verify RED**

Run: `npm test -- src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

Expected: FAIL because `APP_PATHS.RESOURCE_EDIT` and the route do not exist.

- [ ] **Step 3: Add path constants and the lazy nested route**

Add:

```ts
RESOURCE_EDIT: 'edit',
```

and:

```ts
RESOURCE_EDIT: (resourceId: string | number) =>
  `${APP_PATHS.RESOURCE_DETAIL(resourceId)}/${ROUTE_SEGMENTS.RESOURCE_EDIT}`,
```

Lazy-load `ModifyResourcePage` at module scope. Add the nested path `${ROUTE_PARAMS.RESOURCE_ID}/${ROUTE_SEGMENTS.RESOURCE_EDIT}` and metadata title/breadcrumb `Chỉnh sửa tài nguyên` / `Chỉnh sửa`.

- [ ] **Step 4: Implement the preview page**

Read `resourceId` with `useParams`, build typed local initial values using that id, and provide the existing preview option arrays. Both `onClose` and preview `onSubmit` navigate to `APP_PATHS.RESOURCES_MANAGER`.

- [ ] **Step 5: Run the route test and verify GREEN**

Run: `npm test -- src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

Expected: edit route renders, cancel returns to the manager, and existing upload tests remain PASS.

- [ ] **Step 6: Commit the route unit**

```bash
git add src/constants/path.ts src/routes/domains/resourceRoutes.tsx src/features/resources/pages/ModifyResourcePage.tsx src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx
git commit -m "feat: add modify resource route"
```

### Task 3: Link resource rows to the edit route and verify the feature

**Files:**
- Modify: `src/features/resources/components/ResourcesManager.tsx`
- Modify: `src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

**Interfaces:**
- Consumes: `APP_PATHS.RESOURCE_EDIT(resourceId)` and React Router `Link`.
- Produces: an accessible `Chỉnh sửa <resource name>` link per resource row.

- [ ] **Step 1: Write a failing navigation-link assertion**

In the manager route test, find the first row edit link by accessible name and assert its href uses the centralized helper:

```tsx
expect(screen.getByRole('link', { name: 'Chỉnh sửa Báo cáo thực tập_Final.pdf' })).toHaveAttribute(
  'href',
  APP_PATHS.RESOURCE_EDIT('resource-1'),
);
```

- [ ] **Step 2: Run the route test and verify RED**

Run: `npm test -- src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

Expected: FAIL because the table does not expose an edit link.

- [ ] **Step 3: Add the edit action**

Import `Link` from `react-router-dom`, `Pencil` from `lucide-react`, and `APP_PATHS`. Render a keyboard-accessible link beside the existing detail action, using the current primary-soft styling and `aria-label={`Chỉnh sửa ${item.fileName}`}`.

- [ ] **Step 4: Run focused feature tests**

Run: `npm test -- src/features/resources/components/__tests__/ModifyResourceModal.test.tsx src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx`

Expected: all focused tests PASS.

- [ ] **Step 5: Run all verification gates**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all tests pass, ESLint reports zero errors/warnings, and TypeScript/Vite build completes successfully.

- [ ] **Step 6: Commit the completed feature**

```bash
git add src/features/resources/components/ResourcesManager.tsx src/features/resources/pages/__tests__/resourcesManagerRoutes.test.tsx
git commit -m "feat: link resources to modify form"
```
