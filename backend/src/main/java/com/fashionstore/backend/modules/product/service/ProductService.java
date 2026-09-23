package com.fashionstore.backend.modules.product.service;

import com.fashionstore.backend.common.dto.PageResponse;
import com.fashionstore.backend.modules.product.dto.CategoryDto;
import com.fashionstore.backend.modules.product.dto.CreateCategoryRequest;
import com.fashionstore.backend.modules.product.dto.CreateProductRequest;
import com.fashionstore.backend.modules.product.dto.ProductDto;

import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts(boolean onlyActive);
    PageResponse<ProductDto> getProductsPaginated(int page, int size, Long categoryId, boolean onlyActive, String search, String sortBy, String sortDir);
    ProductDto getProductById(Long id);
    ProductDto createProduct(CreateProductRequest request);
    ProductDto restockProduct(Long id, int addedQuantity);
    ProductDto toggleProductStatus(Long id);
    List<CategoryDto> getAllCategories();
    CategoryDto createCategory(CreateCategoryRequest request);
    CategoryDto updateCategory(Long id, CreateCategoryRequest request);
    void deleteCategory(Long id);
}
