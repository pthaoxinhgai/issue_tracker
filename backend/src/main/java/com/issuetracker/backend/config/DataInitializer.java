package com.issuetracker.backend.config;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.Role;
import com.issuetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@issue.com")
                    .password(passwordEncoder.encode("yourpassword123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User support = User.builder()
                    .name("Support Staff")
                    .email("support@issue.com")
                    .password(passwordEncoder.encode("yourpassword123"))
                    .role(Role.SUPPORT_STAFF)
                    .build();
            userRepository.save(support);

            User productOwner = User.builder()
                    .name("Product Owner")
                    .email("po@issue.com")
                    .password(passwordEncoder.encode("yourpassword123"))
                    .role(Role.PRODUCT_OWNER)
                    .build();
            userRepository.save(productOwner);

            User engineeringManager = User.builder()
                    .name("Engineering Manager")
                    .email("manager@issue.com")
                    .password(passwordEncoder.encode("yourpassword123"))
                    .role(Role.ENGINEERING_MANAGER)
                    .build();
            userRepository.save(engineeringManager);

            User developer = User.builder()
                    .name("Developer")
                    .email("dev@issue.com")
                    .password(passwordEncoder.encode("yourpassword123"))
                    .role(Role.DEVELOPER)
                    .build();
            userRepository.save(developer);

            User qa = User.builder()
                    .name("QA Tester")
                    .email("qa@issue.com")
                    .password(passwordEncoder.encode("yourpassword123"))
                    .role(Role.QA)
                    .build();
            userRepository.save(qa);
            
            System.out.println("==================================================");
            System.out.println("Default Accounts Created:");
            System.out.println("admin@issue.com (ADMIN)");
            System.out.println("support@issue.com (SUPPORT_STAFF)");
            System.out.println("po@issue.com (PRODUCT_OWNER)");
            System.out.println("manager@issue.com (ENGINEERING_MANAGER)");
            System.out.println("dev@issue.com (DEVELOPER)");
            System.out.println("qa@issue.com (QA)");
            System.out.println("Password for all accounts: yourpassword123");
            System.out.println("==================================================");
        }
    }
}
