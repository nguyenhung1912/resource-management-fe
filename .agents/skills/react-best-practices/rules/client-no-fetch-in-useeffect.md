---
title: Never Fetch Remote Data or Call APIs Inside useEffect
impact: CRITICAL
impactDescription: prevents render waterfalls, StrictMode double-fetch bugs, and race conditions
tags: client, data-fetching, react-router-v7, loader, event-handlers, useeffect
---

## Never Fetch Remote Data or Call APIs Inside useEffect

Fetching remote data inside `useEffect` on component mount is a severe anti-pattern in modern React applications:
- It creates **client-side render waterfalls** (browser downloads HTML -> downloads JS -> renders component -> finally fires network request).
- It suffers from **race conditions** and memory leaks if components unmount quickly.
- In React StrictMode, effects execute twice in development, causing duplicate requests.
- It requires cumbersome local state boilerplate (`isLoading`, `data`, `error`).

### 1. Page-level Data: Use Route Loaders (React Router v7)

**Incorrect (Component Waterfall in useEffect):**

```tsx
// ❌ WRONG: Render waterfall and StrictMode double-fetch
import { useEffect, useState } from 'react';
import { resourceService } from '@/services/resourceService';

export function ResourceListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourceService.getAll().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <ResourceList items={data} />;
}
```

**Correct (Pre-fetching via React Router v7 Loader):**

```tsx
// ✅ CORRECT: Data is fetched before/parallel to route rendering
import { useLoaderData } from 'react-router-dom';
import { resourceService } from '@/services/resourceService';
import type { ResourceItem } from '@/features/resources/types';

export async function resourceListLoader() {
  const response = await resourceService.getAll();
  return response.data;
}

export function ResourceListPage() {
  const data = useLoaderData() as ResourceItem[];
  return <ResourceList items={data} />;
}
```

### 2. User Interactions & Mutations: Trigger Directly in Event Handlers

**Incorrect (Triggering network requests via state + useEffect):**

```tsx
// ❌ WRONG: Triggering network action through state changes inside useEffect
const [submitCount, setSubmitCount] = useState(0);

useEffect(() => {
  if (submitCount > 0) {
    authService.login(credentials);
  }
}, [submitCount]);
```

**Correct (Calling service directly in Event Handler):**

```tsx
// ✅ CORRECT: Direct event handler invocation
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await authService.login(credentials);
  } finally {
    setIsSubmitting(false);
  }
};
```