package com.phantask.authentication.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/*
Main Spring Security configuration class.

What this file does:
- Defines which APIs are public and which require authentication.
- Registers the JWT filter so every request is checked for a valid token.
- Turns off sessions (we use JWT → stateless authentication).
- Enables CORS and disables CSRF for APIs.
*/
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	 /*
    Security filter chain that controls all HTTP security behaviour.

    Key points:
    1. CORS is enabled so frontend apps (React/Angular) can call the backend.
    2. CSRF is disabled since this is a stateless REST API.
    3. Public endpoints:
         - /api/auth/** → login, refresh-token, etc.
         - /api/users/change-password-first-login → user changes password before login.
    4. All other requests require a valid JWT.
    5. The jwtFilter is placed before UsernamePasswordAuthenticationFilter
       so token validation happens early in the request lifecycle.
   */
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http
        	.cors(cors -> {}) // enable CORS using CorsConfig
        	.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Allow registration & login
                .requestMatchers("/api/users/change-password-first-login").permitAll() // Allow first-login change
                .anyRequest().authenticated() // Protect everything else
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
