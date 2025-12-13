package com.phantask.authentication.service.impl;

import java.util.List;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.phantask.authentication.dto.LoginRequest;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.security.JwtUtil;
import com.phantask.authentication.service.api.IAuthService;

import lombok.RequiredArgsConstructor;

/**
 * Handles all authentication-related operations for the application.
 * 
 * Responsibilities:
 * - User login and password verification
 * - Access token and refresh token generation
 * - Refreshing access tokens
 * - Providing basic user profile info from JWT
 */
@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    /**
     * Handles user login.
     * - Authenticates credentials
     * - Checks if first login (require password change)
     * - Returns access token, refresh token, and roles
     */
    @Override
    public Map<String, Object> login(LoginRequest req) {

        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        if (user.isFirstLogin()) {
            return Map.of("requirePasswordChange", true, "message", "Password change required before login");
        }

        String token = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return Map.of(
                "token", token,
                "refreshToken", refreshToken,
                "role", extractRoleNames(user),
                "requirePasswordChange", false
        );
    }

    /**
     * Generates a new access token using a valid refresh token.
     * - Validates refresh token
     * - Returns new access token
     */
    @Override
    public String refreshToken(String refreshToken) {

        String username = jwtUtil.extractUsername(refreshToken);
        
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid token type. Only refresh tokens are allowed.");
        }
        
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtUtil.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Refresh token expired. Please login again.");
        }
        return jwtUtil.generateAccessToken(user);
    }
    
    /**
     * Returns basic user info for the given JWT token.
     * - Extracts username from token
     * - Loads user entity
     * - Returns username, roles, enabled status, and firstLogin flag
     */
    public Map<String, Object> getCurrentUserProfile(String token) {
        // extract username from token
        String username = jwtUtil.extractUsername(token);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of(
                "username", user.getUsername(),
                "roles", extractRoleNames(user),
                "enabled", user.isEnabled(),
                "firstLogin", user.isFirstLogin()
        );
    }
    
    /**
     * Returns a list of role names assigned to a user.
     */
    private List<String> extractRoleNames(User user) {
        return user.getRoles().stream()
                .map(Role::getRoleName)
                .toList();
    }
}
