import api from './api';
import type { Product } from '../context/StoreContext';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  tag?: string;
  description?: string;
}

interface BackendProductDto {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  tag?: string;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  active?: boolean;
}

function mapProduct(p: BackendProductDto): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category || 'Khác',
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    stock: p.stock ?? 0,
    image: p.image || '',
    tag: p.tag,
    rating: p.rating ?? 5.0,
    reviewsCount: p.reviewsCount ?? 0,
    description: p.description || '',
    isActive: p.active ?? true,
  };
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface GetProductsPageParams {
  page?: number;
  size?: number;
  categoryId?: number;
  onlyActive?: boolean;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const productService = {
  getAll: async (onlyActive = false): Promise<Product[]> => {
    const response = await api.get<BackendProductDto[]>('/api/products', {
      params: { onlyActive },
    });
    return response.data.map(mapProduct);
  },

  getPaginated: async (params?: GetProductsPageParams): Promise<PageResponse<Product>> => {
    const response = await api.get<PageResponse<BackendProductDto>>('/api/products/page', {
      params,
    });
    return {
      ...response.data,
      content: (response.data.content || []).map(mapProduct),
    };
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<BackendProductDto>(`/api/products/${id}`);
    return mapProduct(response.data);
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await api.post<BackendProductDto>('/api/products', payload);
    return mapProduct(response.data);
  },

  restock: async (id: number, addedQuantity: number): Promise<Product> => {
    const response = await api.patch<BackendProductDto>(`/api/products/${id}/stock`, {
      addedQuantity,
    });
    return mapProduct(response.data);
  },

  toggleStatus: async (id: number): Promise<Product> => {
    const response = await api.patch<BackendProductDto>(`/api/products/${id}/status`);
    return mapProduct(response.data);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories');
    return response.data;
  },

  createCategory: async (payload: { name: string; slug?: string; description?: string; imageUrl?: string }): Promise<Category> => {
    const response = await api.post<Category>('/api/categories', payload);
    return response.data;
  },

  updateCategory: async (id: number, payload: { name?: string; slug?: string; description?: string; imageUrl?: string }): Promise<Category> => {
    const response = await api.put<Category>(`/api/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },
};
