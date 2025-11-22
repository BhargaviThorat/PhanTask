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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    //private final RoleRepository roleRepo;
    //private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

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

    public String logout(String token) {
        // In state-less JWT, we simply return success
        // Real invalidation requires token blacklist (optional)
        return "Logged out successfully";
    }
    
}


