package com.phantask.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.RegisterRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.entity.UserProfile;
import com.phantask.authentication.repository.RoleRepository;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.service.UserService;

import lombok.RequiredArgsConstructor;

/**
 * REST controller that exposes user-related endpoints.
 *
 * <p>Provides endpoints to:
 * <ul>
 *   <li>Create a student account with a temporary password</li>
 *   <li>Retrieve the authenticated user's profile</li>
 *   <li>Update the authenticated user's profile</li>
 *   <li>Change the authenticated user's password</li>
 * </ul>
 *
 * <p>All endpoints are prefixed with "/api/users".
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;

    /**
     * Create a new student user.
     *
     * <p>This method:
     * <ol>
     *   <li>Validates that the requested username does not already exist</li>
     *   <li>Creates a new {@link User} with a default temporary password ("Temp@123")</li>
     *   <li>Marks the user as enabled and forces a first-login password change</li>
     *   <li>Assigns the role with name "STUDENT" to the created user</li>
     * </ol>
     *
     * @param req a {@link RegisterRequest} containing username and email for the new student
     * @return 200 OK with a success message and the temporary password when creation succeeds;
     *         400 Bad Request when the username already exists
     * @throws RuntimeException if the "STUDENT" role cannot be found in the database
     */
    @PostMapping("/create-student")
    public ResponseEntity<?> createStudent(@RequestBody RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode("Temp@123")); // default password
        user.setEnabled(true);
        user.setFirstLogin(true); // force password change on first login
        userRepo.save(user);
        Role studentRole = roleRepo.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));
        user.getRoles().add(studentRole);

        userRepo.save(user);
        return ResponseEntity.ok("Student account created successfully. Temporary password: Temp@123");
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


