package com.phantask.authentication.service.api;

import java.util.List;

/**
 * Service interface for role management operations.
 * 
 * <p>
 * Defines business logic for adding and retrieving roles in the system.
 */
public interface IRoleService {
    
    /**
     * Add a new role to the system.
     * 
     * @param roleName the name of the role to add (will be converted to uppercase)
     * @throws IllegalArgumentException if the role already exists
     */
    void addRole(String roleName);
    
    /**
     * Retrieve all roles in the system.
     * 
     * @return a list of all role names
     */
    List<String> getAllRoles();
}
