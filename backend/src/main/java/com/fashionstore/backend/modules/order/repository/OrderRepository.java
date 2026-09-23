package com.fashionstore.backend.modules.order.repository;

import com.fashionstore.backend.modules.order.entity.Order;
import com.fashionstore.backend.modules.order.entity.OrderStatus;
import com.fashionstore.backend.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    List<Order> findAllByOrderByCreatedAtDesc();
    Optional<Order> findByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(o.processedBy IS NOT NULL AND LOWER(o.processedBy) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Order> searchOrders(
            @Param("status") OrderStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
