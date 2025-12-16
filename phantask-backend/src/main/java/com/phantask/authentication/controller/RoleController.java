package com.phantask.authentication.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantask.authentication.service.api.IRoleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller that exposes role-related endpoints.
 * 
 * <p>
 * Provides endpoints to:
 * <ul>
 * <li>Add a new role to the system</li>
 * <li>Retrieve all available roles</li>
 * </ul>
 * 
 * <p>
 * NOTE: Authorization rules are enforced at the service layer using
 * {@code @PreAuthorize} to ensure security.
 * 
 * <p>
 * All endpoints are prefixed with "/api/roles".
 */
@Slf4j
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final IRoleService roleService;

    /**
     * Add a new role to the system.
     * 
     * <p>
     * Only ADMIN users can add roles. The role name should be unique and follow
     * uppercase convention (e.g., "USER", "TRAINEE").
     * 
     * @param request a Map containing the role name under key "roleName"
     * @return 201 Created with success message when role is added successfully;
     *         400 Bad Request if role already exists or validation fails;
     *         500 Internal Server Error for unexpected errors
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addRole(@RequestBody Map<String, String> request) {
        String roleName = request.get("roleName");
        
        if (roleName == null || roleName.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Role name is required"));
        }
        
        try {
            roleService.addRole(roleName);
            log.info("Role '{}' added successfully", roleName.toUpperCase());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Role '" + roleName.toUpperCase() + "' added successfully"));
        } catch (IllegalArgumentException ex) {
            log.warn("Failed to add role '{}': {}", roleName, ex.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error adding role '{}': {}", roleName, ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add role"));
        }
    }

    /**
     * Retrieve all roles in the system.
     * 
     * <p>
     * Returns a list of all role names. This endpoint is accessible to
     * authenticated users to populate dropdowns and role selection UIs.
     * 
     * @return 200 OK with a list of role names
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/all")
    public ResponseEntity<List<String>> getAllRoles() {
        try {
            List<String> roles = roleService.getAllRoles();
            log.debug("Retrieved {} roles", roles.size());
            return ResponseEntity.ok(roles);
        } catch (Exception ex) {
            log.error("Error retrieving roles: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
