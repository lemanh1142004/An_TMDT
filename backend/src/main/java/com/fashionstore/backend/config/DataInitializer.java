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
        log.info("Checking initial system roles and default admin account...");

        // 1. Seed Roles
        Role customerRole = seedRole(RoleType.ROLE_CUSTOMER, "Khách hàng mua sắm");
        Role adminRole = seedRole(RoleType.ROLE_ADMIN, "Quản trị viên hệ thống");
        seedRole(RoleType.ROLE_STAFF, "Nhân viên vận hành & quản lý đơn");

        // 2. Seed Default Admin if not exists
        String adminEmail = "admin@fashionstore.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            Set<Role> roles = new HashSet<>();
            roles.add(customerRole);
            roles.add(adminRole);

            User admin = User.builder()
                    .fullName("Fashion Store Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("AdminPassword123!"))
                    .phoneNumber("0901234567")
                    .active(true)
                    .authProvider("LOCAL")
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            log.info("Default administrator account created: {}", adminEmail);
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
