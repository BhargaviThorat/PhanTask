package com.phantask.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.RegisterRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;


import com.phantask.authentication.entity.UserProfile;
import com.phantask.authentication.service.api.IUserService;
import lombok.RequiredArgsConstructor;

/**
 * REST controller that exposes user-related end-points.
 *
 * <p>Provides end-points to:
 * <ul>
 *   <li>Create a student account with a temporary password</li>
 *   <li>Retrieve the authenticated user's profile</li>
 *   <li>Update the authenticated user's profile</li>
 *   <li>Change the authenticated user's password</li>
 * </ul>
 *
 * <p>All end-points are prefixed with "/api/users".
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;

    /**
     * Create a new student user.
     * 
     * @param req a {@link RegisterRequest} containing user-name and email for the new student
     * @return 200 OK with a success message and the temporary password when creation succeeds;
     *         400 Bad Request when the user-name already exists
     * @throws RuntimeException if the "STUDENT" role cannot be found in the database
     */
    @PostMapping("/create-student")
    public ResponseEntity<String> createAccount(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(userService.createAccount(req.getEmail()));
    }
    
    @PostMapping("/change-password-first-login")
    public ResponseEntity<String> changePasswordFirstLogin(@RequestBody PasswordChangeRequest req) {
        return ResponseEntity.ok(userService.changePasswordFirstLogin(req));
    }

    /**
     * Retrieve the profile of the currently authenticated user.
     *
     * @param auth the Spring Security {@link Authentication} object for the current request
     * @return 200 OK with the {@link UserProfile} of the authenticated user
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    /**
     * Update the profile for the currently authenticated user.
     *
     * @param auth the Spring Security {@link Authentication} object for the current request
     * @param req  an {@link UpdateProfileRequest} containing profile fields to update
     * @return 200 OK with a message describing the result of the update operation
     */
    @PostMapping("/update-profile")
    public ResponseEntity<String> updateProfile(
        Authentication auth,
        @RequestBody UpdateProfileRequest req
    ) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), req));
    }

    /**
     * Change the password for the currently authenticated user.
     *
     * @param auth the Spring Security {@link Authentication} object for the current request
     * @param req  a {@link PasswordChangeRequest} containing the old and new passwords
     * @return 200 OK with a message describing the result of the password change
     */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
        Authentication auth,
        @RequestBody PasswordChangeRequest req
    ) {
        return ResponseEntity.ok(userService.changePassword(auth.getName(), req));
    }
}


