import { useState, useEffect, useDeferredValue } from 'react';
import { useSearchParams, useSubmit } from 'react-router-dom';
import type { SearchTab } from '../types/search.types';

export function useSearchFilters() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedFaculty, setSelectedFaculty] = useState(searchParams.get('subMajorCode') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('fileTypeId') || 'all');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('yearCompleted') || '');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('fileTypeId') || 'all');

  const deferredQuery = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    const params = new URLSearchParams();

    if (deferredQuery) params.set('q', deferredQuery);
    if (selectedFaculty !== 'all') params.set('subMajorCode', selectedFaculty);
    if (selectedYear) params.set('yearCompleted', selectedYear);

    const finalFileTypeId =
      selectedFormat !== 'all' ? selectedFormat : selectedCategory !== 'all' ? selectedCategory : null;
    if (finalFileTypeId) params.set('fileTypeId', finalFileTypeId);

    submit(params, { replace: true });
  }, [deferredQuery, selectedFaculty, selectedCategory, selectedFormat, selectedYear, submit]);

  const handleResetFilters = () => {
    setSelectedFaculty('all');
    setSelectedCategory('all');
    setSelectedFormat('all');
    setSelectedYear('');
    setSearchQuery('');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    submit(params, { replace: true });
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedFaculty,
    setSelectedFaculty,
    selectedCategory,
    setSelectedCategory,
    selectedYear,
    setSelectedYear,
    selectedFormat,
    setSelectedFormat,
    handleResetFilters,
    handlePageChange,
  };
}
