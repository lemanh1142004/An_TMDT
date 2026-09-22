package com.fashionstore.backend.modules.product.service;

import com.fashionstore.backend.modules.product.dto.CategoryDto;
import com.fashionstore.backend.modules.product.dto.CreateProductRequest;
import com.fashionstore.backend.modules.product.dto.ProductDto;

import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts(boolean onlyActive);
    ProductDto getProductById(Long id);
    ProductDto createProduct(CreateProductRequest request);
    ProductDto restockProduct(Long id, int addedQuantity);
    ProductDto toggleProductStatus(Long id);
    List<CategoryDto> getAllCategories();
}
