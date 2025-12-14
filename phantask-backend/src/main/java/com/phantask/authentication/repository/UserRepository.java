package com.phantask.authentication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantask.authentication.entity.User;

/**
 * Repository for performing CRUD and query operations on {@link User} entities.
 *
 * <p>
 * Extends {@link JpaRepository} to inherit standard persistence methods. Define
 * any additional query methods here that are needed by services and controllers
 * (by convention Spring Data will implement them automatically).
 * </p>
 *
 * <p>
 * Examples of convenient query methods:
 * <ul>
 *   <li>existsByUsername(String username)</li>
 *   <li>findByUsername(String username)</li>
 *   <li>findByEmail(String email)</li>
 * </ul>
 * </p>
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their username.
     *
     * @param username the username to search for
     * @return an {@link Optional} containing the found {@link User}, or empty if
     *         not found
     */
    Optional<User> findByUsername(String username);

    /**
     * Check whether a user with the given username exists.
     *
     * @param username the username to check for existence
     * @return true if a user with the username exists, false otherwise
     */
    boolean existsByUsername(String username);
    
    /**
     * Retrieve all active users.
     *
     * <p>
     * An active user is defined as a user with {@code enabled = true}.
     * </p>
     *
     * @return a list of all enabled users
     */
    List<User> findAllByEnabledTrue();

    /**
     * Retrieve all inactive users.
     *
     * <p>
     * An inactive user is defined as a user with {@code enabled = false}.
     * Typically used for administrative user management screens.
     * </p>
     *
     * @return a list of all disabled users
     */
    List<User> findAllByEnabledFalse();

    /**
     * Find an active user by their unique identifier.
     *
     * <p>
     * This method ensures that only users with {@code enabled = true}
     * are returned.
     * </p>
     *
     * @param uid the unique user ID
     * @return an {@link Optional} containing the active {@link User},
     *         or empty if not found or inactive
     */
    Optional<User> findByUidAndEnabledTrue(Long uid);

    /**
     * Find an inactive user by their unique identifier.
     *
     * <p>
     * Commonly used during user reactivation workflows to ensure
     * the user is currently disabled.
     * </p>
     *
     * @param uid the unique user ID
     * @return an {@link Optional} containing the inactive {@link User},
     *         or empty if not found or already active
     */
    Optional<User> findByUidAndEnabledFalse(Long uid);
}
