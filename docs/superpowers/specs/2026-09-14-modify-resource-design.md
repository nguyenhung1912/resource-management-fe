# Modify Resource Design

## Goal

Add a preview edit flow for an uploaded resource. Users can update the resource metadata and its banner image, but cannot replace the original document file.

## Scope

- Add a dedicated edit route at `/dashboard/resources-manager/:resourceId/edit`.
- Add a `Chỉnh sửa` action for each resource in the management table.
- Open the edit experience as a modal page, consistent with the existing upload flow.
- Show the current document as read-only context.
- Allow editing the name, description, file type, sub-major, course, completion year, authors, keywords, and banner image.
- Restrict banner uploads to PNG, JPEG, or WebP files up to 5 MB.
- Keep author and keyword entries unique using the existing input components.
- Use preview data only; no API or persistence layer is introduced in this change.

## Architecture

Create a dedicated `ModifyResourceModal` instead of adding upload/edit modes to `UploadResourceModal`. The two forms share existing focused inputs (`AuthorInput`, `KeywordInput`, `ResourceFileDropzone`, and `BaseModal`) while keeping their different rules explicit: upload requires a document, edit presents that document as immutable.

`ModifyResourcePage` owns route-level preview data and navigation. It passes initial resource values into the modal, handles cancel/save, and returns to the resource manager. The page is lazy-loaded from the resource route module, matching the existing route architecture.

## Components and Interfaces

### `ModifyResourceModal`

The modal receives:

- `isOpen: boolean`
- `resource`: a typed initial-value object containing document summary and editable metadata
- option arrays for file types, sub-majors, courses, and years
- `onClose: () => void`
- `onSubmit: (values: ModifyResourceFormValues) => void`

The submit payload excludes the original document file. It contains only editable metadata and an optional replacement banner image.

The document summary displays the original filename, file type, and size, with clear copy that the document cannot be changed. There is no document file input in this form.

### `ModifyResourcePage`

The route page reads `resourceId`, constructs typed preview data, and renders the modal. Cancel and preview save both navigate to `APP_PATHS.RESOURCES_MANAGER`.

### Resource table action

Each row exposes a `Chỉnh sửa` link using `APP_PATHS.RESOURCE_EDIT(resourceId)`. Existing resource actions remain intact.

## Routing

- Add `RESOURCE_EDIT: 'edit'` to `ROUTE_SEGMENTS`.
- Add `APP_PATHS.RESOURCE_EDIT(resourceId)` composed from centralized path constants.
- Add the nested route `${ROUTE_PARAMS.RESOURCE_ID}/${ROUTE_SEGMENTS.RESOURCE_EDIT}`.
- Lazy-load `ModifyResourcePage` and wrap it in `RouteSuspense`.
- Do not add a loader because this iteration uses local preview data and performs no remote fetch.

## Form Behavior

- Initialize all metadata fields from the selected preview resource.
- Require resource name, file type, sub-major, and at least one author.
- Trim free-text values before submission.
- Preserve case-insensitive uniqueness for authors and keywords through the existing components.
- Accept only `image/png`, `image/jpeg`, and `image/webp` for the banner.
- Reject banner files larger than 5 MB with an inline error.
- Keep the current banner when no replacement image is selected.

## Responsive and Interaction Design

- Reuse `BaseModal` with `fullScreenOnMobile`.
- On small screens, the form occupies the viewport and only the modal body scrolls.
- On larger screens, the dialog is centered with a constrained height; scrolling outside the dialog does not move the page.
- Use semantic Essential design tokens, soft borders, rounded containers, Lucide icons, and visible focus states.
- Ensure all inputs have labels and validation messages are announced with accessible semantics.

## Error Handling

Validation stays local to the form. Invalid image type/size and missing required fields prevent submission and show field-level feedback. Because this is a preview-only flow, no server error state or mutation loading state is required.

## Testing

- Component tests verify initial metadata is populated.
- Component tests verify there is no document replacement input.
- Component tests verify unsupported and oversized banner images are rejected.
- Component tests verify edited values are passed in the submit payload and the original document is absent.
- Route tests verify the centralized edit URL renders the modify page.
- Resource manager tests verify the edit action targets the centralized edit path.
- Final verification runs the focused tests, full test suite, `npm run lint`, and `npm run build`.

## Out of Scope

- Fetching resource details from an API.
- Persisting modifications to a backend.
- Replacing or deleting the original document.
- Cropping, compressing, or otherwise transforming banner images.
- Introducing a shared upload/edit form abstraction.
