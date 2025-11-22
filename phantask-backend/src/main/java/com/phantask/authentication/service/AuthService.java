package com.phantask.authentication.service;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import com.phantask.authentication.dto.LoginRequest;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.security.JwtUtil;

import lombok.RequiredArgsConstructor;

/**
 * Service responsible for authentication-related operations.
 *
 * <p>This service centralizes logic for user authentication, registration, token issuance,
 * refresh and invalidation. Keep security-sensitive details (keys, token expirations, etc.)
 * configurable and avoid leaking secrets in logs or error messages.
 *
 * <p>Typical responsibilities:
 * <ul>
 *   <li>Authenticate credentials and return access/refresh tokens</li>
 *   <li>Register new users and apply initial roles/policies</li>
 *   <li>Refresh access tokens using a refresh token</li>
 *   <li>Invalidate tokens / handle logout</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    //private final RoleRepository roleRepo;
    //private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
  
    /**
     * Register a new user account.
     *
     * <p>Expected behavior:
     * <ul>
     *   <li>Validate incoming registration data</li>
     *   <li>Ensure unique username/email</li>
     *   <li>Create user entity with encoded password and initial roles</li>
     * </ul>
     *
     * @param registerRequest DTO containing registration information (username, email, etc.)
     * @return confirmation message or identifier for the created user
     * @throws RuntimeException when registration cannot be completed (validation or persistence errors)
     */
    /*
    public String register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already exists");
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setEnabled(true);
        Role role = roleRepo.findByRoleName(req.getRole()).orElseThrow();
        user.getRoles().add(role);
        userRepo.save(user);
        return "Registered successfully";
    }*/

    /**
     * Authenticate a user using the provided credentials.
     *
     * <p>Expected behavior:
     * <ol>
     *   <li>Validate the supplied credentials (username/password)</li>
     *   <li>On success, generate and return an access token (and optionally a refresh token)</li>
     *   <li>On failure, throw an appropriate authentication exception</li>
     * </ol>
     *
     * @param loginRequest DTO containing username and password (and optional remember-me)
     * @return a token string (or an authentication response object containing tokens and metadata)
     * @throws org.springframework.security.core.AuthenticationException if authentication fails
     */
    public Map<String, Object> login(LoginRequest req) {

        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Authenticate credentials
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        // If first login → force password change
        if (user.isFirstLogin()) {
            return Map.of(
                    "requirePasswordChange", true,
                    "message", "Password change required before login"
            );
        }

        //Normal login → generate token
        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return Map.of(
                "token", token,
                "refreshToken", refreshToken,
                "role", user.getRoles().stream().map(Role::getRoleName).toList(),
                "requirePasswordChange", false
        );
    }

    /**
     * Refresh an access token using a valid refresh token.
     *
     * <p>Expected behavior:
     * <ol>
     *   <li>Validate the refresh token (signature, expiration, revocation)</li>
     *   <li>Issue a new access token (and possibly a new refresh token)</li>
     * </ol>
     *
     * @param refreshToken the refresh token presented by the client
     * @return a new access token (or an object containing access + refresh tokens)
     * @throws RuntimeException if the refresh token is invalid or expired
     */
    public String refreshToken(String refreshToken) {
    	
    	// 1.Extract user-name
        String username = jwtUtil.extractUsername(refreshToken);

        // 2. Load user
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Convert to UserDetails for validation
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
                .collect(Collectors.toList())
        );
        
        // 4. Validate token (NOT expired + NOT tampered)
        if (!jwtUtil.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token expired. Please login again.");
        }

        // 5. Generate new ACCESS TOKEN
        return jwtUtil.generateToken(user); // new access token
    }

    /**
     * Invalidate authentication state for a user (logout).
     *
     * <p>Typical tasks:
     * <ul>
     *   <li>Revoke refresh tokens associated with the user/session</li>
     *   <li>Perform audit/logging if required</li>
     *   <li>Clear server-side session state if sessions are used</li>
     * </ul>
     *
     * @param username the username for which to invalidate tokens / terminate sessions
     */
    public String logout(String token) {
        // In state-less JWT, we simply return success
        // Real invalidation requires token blacklist (optional)
        return "Logged out successfully";
    }
    
}


