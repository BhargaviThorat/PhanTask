package com.phantask.authentication.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.phantask.authentication.entity.Role;

/**
 * Repository for accessing {@link Role} entities.
 * 
 * <p>
 * Provides data access methods for role management operations.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    /**
     * Find a role by its unique role name.
     * 
     * @param roleName the name of the role (e.g., "USER", "ADMIN")
     * @return an Optional containing the Role if found, empty otherwise
     */
    Optional<Role> findByRoleName(String roleName);
    
    /**
     * Check if a role with the given name exists.
     * 
     * @param roleName the name of the role to check
     * @return true if the role exists, false otherwise
     */
    boolean existsByRoleName(String roleName);
}
