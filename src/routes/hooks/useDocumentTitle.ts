import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';
import type { RouteHandle } from '../types';

export function useDocumentTitle(fallbackTitle = 'Resource Management System') {
  const matches = useMatches();

  useEffect(() => {
    const currentMatch = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.meta?.title);
    const title = (currentMatch?.handle as RouteHandle | undefined)?.meta?.title;
    document.title = title ? `${title} | Resource Management System` : fallbackTitle;
  }, [matches, fallbackTitle]);
}

export default useDocumentTitle;
