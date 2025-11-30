package com.phantask.authentication.service.impl;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.phantask.authentication.dto.LoginRequest;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.security.JwtUtil;
import com.phantask.authentication.service.api.IAuthService;

import lombok.RequiredArgsConstructor;

/**
 * Service responsible for authentication-related operations.
 *
 * <p>
 * This service centralizes logic for user authentication, registration, token
 * issuance, refresh, and invalidation. Keep security-sensitive details (keys,
 * token expirations, etc.) configurable and avoid leaking secrets in logs or
 * error messages.
 * </p>
 *
 * <p>
 * Typical responsibilities:
 * <ul>
 *   <li>Authenticate credentials and return access/refresh tokens</li>
 *   <li>Register new users and apply initial roles/policies</li>
 *   <li>Refresh access tokens using a refresh token</li>
 *   <li>Invalidate tokens / handle logout</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    /**
     * Authenticate a user using the provided credentials.
     *
     * <p>
     * Expected behaviour:
     * <ol>
     *   <li>Validate the supplied credentials (username/password)</li>
     *   <li>On success, generate and return an access token (and optionally a refresh
     *       token)</li>
     *   <li>On failure, throw an appropriate authentication exception</li>
     * </ol>
     * </p>
     *
     * @param req DTO containing username and password (and optional remember-me)
     * @return a map containing tokens, roles, and password change requirement
     * @throws org.springframework.security.core.AuthenticationException if authentication fails
     */
    @Override
    public Map<String, Object> login(LoginRequest req) {

        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Authenticate credentials
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        // If first login → force password change
        if (user.isFirstLogin()) {
            return Map.of("requirePasswordChange", true, "message", "Password change required before login");
        }

        // Normal login → generate token
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
     * <p>
     * Expected behaviour:
     * <ol>
     *   <li>Validate the refresh token (signature, expiration, revocation)</li>
     *   <li>Issue a new access token (and possibly a new refresh token)</li>
     * </ol>
     * </p>
     *
     * @param refreshToken the refresh token presented by the client
     * @return a new access token (or an object containing access and refresh tokens)
     * @throws RuntimeException if the refresh token is invalid or expired
     */
    @Override
    public String refreshToken(String refreshToken) {

        // 1. Extract username
        String username = jwtUtil.extractUsername(refreshToken);
        // 2. Load user
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        // 3. Convert to UserDetails for validation
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
                        .collect(Collectors.toList())
        );
        // 4. Validate token (not expired and not tampered)
        if (!jwtUtil.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token expired. Please login again.");
        }
        // 5. Generate new access token
        return jwtUtil.generateToken(user);
    }

    /**
     * Invalidate authentication state for a user (logout).
     *
     * <p>
     * Typical tasks:
     * <ul>
     *   <li>Revoke refresh tokens associated with the user/session</li>
     *   <li>Perform audit/logging if required</li>
     *   <li>Clear server-side session state if sessions are used</li>
     * </ul>
     * </p>
     *
     * @param token the token string to invalidate or user session to terminate
     * @return a message indicating successful logout
     */
	/*
	 * @Override public String logout(String token) { // In stateless JWT, we simply
	 * return success. // Real invalidation requires a token blacklist (optional).
	 * return "Logged out successfully"; }
	 */
    
    /**
     * Resolve basic profile information for the user associated with the
     * provided JWT.
     *
     * <p>
     * This method is typically invoked by a {@code /api/auth/me} endpoint
     * to let a client verify that its stored access token is still valid
     * and belongs to an active user. The method will:
     * </p>
     * <ol>
     *   <li>Extract the username from the supplied JWT</li>
     *   <li>Load the corresponding {@link User} entity</li>
     *   <li>Return a minimal map of profile attributes that the SPA can
     *       cache in memory (for example: username and roles)</li>
     * </ol>
     *
     * @param token the raw JWT string (without the {@code Bearer } prefix)
     * @return a map containing lightweight user profile data such as
     *         {@code username} and {@code roles}
     * @throws RuntimeException if the token is invalid, expired or the user
     *                          cannot be found
     */
    public Map<String, Object> getCurrentUserProfile(String token) {
        // extract username from token
        String username = jwtUtil.extractUsername(token);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of(
                "username", user.getUsername(),
                "roles", user.getRoles().stream()
                        .map(Role::getRoleName)
                        .collect(Collectors.toSet()),
                "enabled", user.isEnabled(),
                "firstLogin", user.isFirstLogin()
        );
    }
}
