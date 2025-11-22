package com.phantask.authentication.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantask.authentication.entity.User;

/**
 * Repository for performing CRUD and query operations on {@link User} entities.
 *
 * <p>Extends {@link JpaRepository} to inherit standard persistence methods. Define any
 * additional query methods here that are needed by services and controllers
 * (by convention Spring Data will implement them automatically).
 *
 * <p>Examples of convenient query methods:
 * <ul>
 *   <li>existsByUsername(String username)</li>
 *   <li>findByUsername(String username)</li>
 *   <li>findByEmail(String email)</li>
 * </ul>
 */
public interface UserRepository extends JpaRepository<User, Long>{

	/**
     * Find a user by their username.
     *
     * @param username the username to search for
     * @return an {@link Optional} containing the found {@link User}, or empty if not found
     */
	Optional<User> findByUsername(String username);
	/**
     * Check whether a user with the given username exists.
     *
     * @param username the username to check for existence
     * @return true if a user with the username exists, false otherwise
     */
	boolean existsByUsername(String username);
}
