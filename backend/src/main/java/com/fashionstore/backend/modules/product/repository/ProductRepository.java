package com.fashionstore.backend.modules.product.repository;

import com.fashionstore.backend.modules.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByCreatedAtDesc();
    List<Product> findAllByOrderByCreatedAtDesc();
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    @Query("SELECT p FROM Product p WHERE " +
           "(:onlyActive = false OR p.active = true) AND " +
           "(:categoryId IS NULL OR (p.category IS NOT NULL AND p.category.id = :categoryId)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> searchProducts(
            @Param("categoryId") Long categoryId,
            @Param("onlyActive") boolean onlyActive,
            @Param("search") String search,
            Pageable pageable
    );
}
