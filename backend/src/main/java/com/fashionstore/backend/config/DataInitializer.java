package com.fashionstore.backend.config;

import com.fashionstore.backend.modules.user.entity.Role;
import com.fashionstore.backend.modules.user.entity.RoleType;
import com.fashionstore.backend.modules.user.entity.User;
import com.fashionstore.backend.modules.user.repository.RoleRepository;
import com.fashionstore.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking initial system roles and default demo accounts...");

        // 1. Seed Roles
        Role customerRole = seedRole(RoleType.ROLE_CUSTOMER, "Khách hàng mua sắm");
        Role adminRole = seedRole(RoleType.ROLE_ADMIN, "Quản trị viên hệ thống");
        Role staffRole = seedRole(RoleType.ROLE_STAFF, "Nhân viên vận hành & quản lý đơn");

        // 2. Seed Default Admin
        seedUserIfNotExists(
                "admin@fashionstore.com",
                "AdminPassword123!",
                "Fashion Store Administrator",
                "0901234567",
                Set.of(adminRole, customerRole)
        );

        // 3. Seed Default Staff
        seedUserIfNotExists(
                "staff@fashionstore.com",
                "StaffPassword123!",
                "Nguyễn Văn Nhân Viên",
                "0902345678",
                Set.of(staffRole)
        );

        // 4. Seed Default Customer
        seedUserIfNotExists(
                "customer@fashionstore.com",
                "CustomerPassword123!",
                "Trần Thị Khách Hàng",
                "0903456789",
                Set.of(customerRole)
        );
    }

    private void seedUserIfNotExists(String email, String rawPassword, String fullName, String phone, Set<Role> roles) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .phoneNumber(phone)
                    .active(true)
                    .authProvider("LOCAL")
                    .roles(new HashSet<>(roles))
                    .build();

            userRepository.save(user);
            log.info("Default account created: {} [{}]", email, roles.stream().map(r -> r.getName().name()).toList());
        }
    }

    private Role seedRole(RoleType roleType, String description) {
        return roleRepository.findByName(roleType)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name(roleType)
                            .description(description)
                            .build();
                    return roleRepository.save(role);
                });
    }
}
