---
title: Dynamic Imports for Heavy Components
impact: CRITICAL
impactDescription: directly affects TTI and initial bundle size
tags: bundle, dynamic-import, code-splitting, react-lazy
---

## Dynamic Imports for Heavy Components

Use `React.lazy()` and `Suspense` to code-split and lazily load large components not needed on initial render.

**Incorrect (Monaco editor bundles into main chunk ~300KB):**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**Correct (Monaco editor loads asynchronously on demand):**

```tsx
import { lazy, Suspense } from 'react'

const MonacoEditor = lazy(() =>
  import('./monaco-editor').then(m => ({ default: m.MonacoEditor }))
)

function CodePanel({ code }: { code: string }) {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-text-muted">Loading editor...</div>}>
      <MonacoEditor value={code} />
    </Suspense>
  )
}
```