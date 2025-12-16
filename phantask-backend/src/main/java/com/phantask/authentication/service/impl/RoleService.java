package com.phantask.authentication.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.phantask.authentication.entity.Role;
import com.phantask.authentication.repository.RoleRepository;
import com.phantask.authentication.service.api.IRoleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service implementation for role management.
 * 
 * <p>
 * Handles business logic for adding and retrieving roles.
 * Authorization is enforced at this layer using {@code @PreAuthorize}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoleService implements IRoleService {
    
    private final RoleRepository roleRepository;
    
    /**
     * Add a new role to the system.
     * 
     * <p>
     * Only ADMIN users can add roles. The role name is converted to uppercase
     * for consistency.
     * 
     * @param roleName the name of the role to add
     * @throws IllegalArgumentException if the role already exists
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void addRole(String roleName) {
        // Convert to uppercase for consistency
        String normalizedRoleName = roleName.trim().toUpperCase();
        
        // Check if role already exists
        if (roleRepository.existsByRoleName(normalizedRoleName)) {
            log.warn("Attempted to add duplicate role: {}", normalizedRoleName);
            throw new IllegalArgumentException("Role '" + normalizedRoleName + "' already exists");
        }
        
        // Create and save new role
        Role role = new Role();
        role.setRoleName(normalizedRoleName);
        roleRepository.save(role);
        
        log.info("Successfully added new role: {}", normalizedRoleName);
    }
    
    /**
     * Retrieve all roles in the system.
     * 
     * <p>
     * Returns a list of role names sorted alphabetically.
     * Accessible to all authenticated users.
     * 
     * @return a sorted list of all role names
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public List<String> getAllRoles() {
        List<String> roles = roleRepository.findAll()
                .stream()
                .map(Role::getRoleName)
                .sorted()
                .collect(Collectors.toList());
        
        log.debug("Retrieved {} roles from database", roles.size());
        return roles;
    }
}
