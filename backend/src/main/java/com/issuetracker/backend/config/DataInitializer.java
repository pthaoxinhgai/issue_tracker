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
                    .role(Role.MAINTAINER)
                    .build();
            userRepository.save(admin);
            System.out.println("==================================================");
            System.out.println("Default Admin account created!");
            System.out.println("Email: admin@issue.com");
            System.out.println("Password: yourpassword123");
            System.out.println("Role: MAINTAINER");
            System.out.println("==================================================");
        }
    }
}
