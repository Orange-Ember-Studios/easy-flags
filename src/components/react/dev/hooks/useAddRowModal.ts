import { useState, useCallback } from "react";

interface UseAddRowModalReturn {
  showAddModal: boolean;
  formData: Record<string, string>;
  openAddModal: () => void;
  closeAddModal: () => void;
  handleFormChange: (column: string, value: string) => void;
  resetFormData: () => void;
}

/**
 * Custom hook for managing add row modal state and form data
 * Encapsulates all modal-related logic for cleaner component
 */
export function useAddRowModal(): UseAddRowModalReturn {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const openAddModal = useCallback(() => {
    setFormData({});
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setFormData({});
  }, []);

  const handleFormChange = useCallback((column: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData({});
  }, []);

  return {
    showAddModal,
    formData,
    openAddModal,
    closeAddModal,
    handleFormChange,
    resetFormData,
  };
}
