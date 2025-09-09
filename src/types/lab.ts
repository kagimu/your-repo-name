export type LabItemCategory = "specimen" | "chemical" | "apparatus";

export interface LabItem {
  id: string;
  name: string;
  category: LabItemCategory;
  quantity: number;
  unit: string;
  threshold: number;
  productId?: string;
  location?: string;
  notes?: string;
  lastUpdated: string;
}

export interface LabProduct {
  id: string;
  name: string;
  sku?: string;
  unit?: string;
  stock?: number;
  price?: number;
  description?: string;
  image?: string;
}

export interface LabInventoryStats {
  totalItems: number;
  lowStockCount: number;
  lastSyncTime: string;
}

export interface LabFilter {
  search: string;
  category: LabItemCategory | "all";
  sortBy: "name" | "quantity" | "lastUpdated";
  sortOrder: "asc" | "desc";
}

// Feature flag type
export interface LabFeatureFlags {
  labManagementEnabled: boolean;
}
