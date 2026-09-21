package com.fashionstore.backend.modules.user.repository;

import com.fashionstore.backend.modules.user.entity.Role;
import com.fashionstore.backend.modules.user.entity.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
