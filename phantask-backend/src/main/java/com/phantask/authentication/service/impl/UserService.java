package com.phantask.authentication.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.phantask.authentication.dto.AccountCreationResponse;
import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.dto.UserProfileResponse;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.entity.UserProfile;
import com.phantask.authentication.repository.RoleRepository;
import com.phantask.authentication.repository.UserProfileRepository;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.service.api.IUserService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service that encapsulates user-related business logic.
 *
 * <p>
 * Responsibilities typically include:
 * <ul>
 *   <li>Retrieving user profile information for display</li>
 *   <li>Applying updates to a user's profile</li>
 *   <li>Handling password change requests and related validations</li>
 * </ul>
 * </p>
 *
 * <p>
 * Keep security-sensitive behaviour (password encoding, validation, audit
 * logging) inside this service and avoid exposing implementation details to
 * controllers.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final UserProfileRepository profileRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // DEBUG
        System.out.println("Username: " + username);
        System.out.println("Password hash from DB: " + user.getPassword());
        // BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        // boolean matches = encoder.matches("Admin@123",
        // "$2a$10$JKTb6X/KVNKDm0BgpDh/feYe6vs/OmLcOBwqeh.eRajP75mjLGbmi");
        // System.out.println("Matches? " + matches);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
                        .collect(Collectors.toList())
        );
    }

    @Override
    @Transactional
    public AccountCreationResponse createAccount(String email) {

        // Extract base username (before @)
        String baseUsername = email.substring(0, email.indexOf("@"));
        String username = baseUsername;

        // Auto-increment username if a duplicate exists
        int counter = 1;
        while (userRepo.existsByUsername(username)) {
            username = baseUsername + counter;  // ex: rahul → rahul1 → rahul2
            counter++;
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);

        String tempPassword = "Temp@123";
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setEnabled(true);
        user.setFirstLogin(true);

        // Fetch STUDENT role
        Role studentRole = roleRepo.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Role: STUDENT not found"));

        user.getRoles().add(studentRole);

        userRepo.save(user);

        // Log securely (NO plain password)
        log.info("Student account created: username={}", username);

        // TODO: do not send the password in response instead mail the student

        return new AccountCreationResponse(username,
                "Student account created successfully. Temporary password is " + tempPassword);
    }

    private String defaultIfNull(String value) {
        return value == null ? "" : value;
    }

    /**
     * Retrieve the profile for the given username.
     *
     * <p>
     * Expected behaviour:
     * <ol>
     *   <li>Look up the user by username</li>
     *   <li>Map persisted user data into a {@link UserProfile} DTO</li>
     *   <li>Return the DTO or throw an appropriate exception if not found</li>
     * </ol>
     * </p>
     *
     * @param username the username whose profile should be retrieved
     * @return the {@link UserProfile} for the user
     * @throws RuntimeException if the user cannot be found or another retrieval error occurs
     */
    @Override
    @Transactional
    public UserProfileResponse getProfile(String username) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            profileRepo.save(profile);
        }

        String primaryRole = user.getRoles().stream()
                .findFirst()
                .map(Role::getRoleName)
                .orElse("UNKNOWN");

        Set<String> allRoles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());

        String base64Pic = null;
        if (profile.getProfilePic() != null) {
            base64Pic = "data:image/png;base64," +
                    java.util.Base64.getEncoder().encodeToString(profile.getProfilePic());
        }

        return new UserProfileResponse(
                user.getUid(),
                user.getUsername(),
                user.getEmail(),
                primaryRole,
                user.isEnabled(),
                user.isFirstLogin(),
                user.getPasswordChangedAt(),
                allRoles,
                defaultIfNull(profile.getFullName()),
                defaultIfNull(profile.getDepartment()),
                defaultIfNull(profile.getPhone()),
                base64Pic,   // FIELD for Profile Pic
                defaultIfNull(profile.getYearOfStudy())
        );
    }

    /**
     * Update the profile of the specified user.
     *
     * <p>
     * Expected behaviour:
     * <ul>
     *   <li>Validate incoming data from {@link UpdateProfileRequest}</li>
     *   <li>Persist permitted changes to the user profile</li>
     *   <li>Return a message indicating success or a description of any failure</li>
     * </ul>
     * </p>
     *
     * @param username the username of the user whose profile will be updated
     * @param req      the {@link UpdateProfileRequest} containing profile fields to change
     * @return a user-facing message describing the result of the update operation
     * @throws RuntimeException if validation or persistence fails
     */
    @Override
    public String updateProfile(String username, UpdateProfileRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileRepo.findByUser(user).orElseGet(() -> {
            UserProfile p = new UserProfile();
            p.setUser(user);  // REQUIRED for shared PK
            return p;
        });

        profile.setFullName(req.getFullName());
        profile.setPhone(req.getPhone());
        profile.setDepartment(req.getDepartment());
        if (req.getProfilePic() != null && !req.getProfilePic().isEmpty()) {
            try {
                profile.setProfilePic(req.getProfilePic().getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read profile picture", e);
            }
        }
        profile.setYearOfStudy(req.getYearOfStudy());

        profileRepo.save(profile);
        return "Profile updated successfully";
    }

    /**
     * Change the password for the given user.
     *
     * <p>
     * Expected behaviour:
     * <ol>
     *   <li>Verify the supplied current password against stored credentials</li>
     *   <li>Validate the new password against strength and policy rules</li>
     *   <li>Encode and persist the new password; clear first-login flag if applicable</li>
     * </ol>
     * </p>
     *
     * @param username the username of the user requesting the password change
     * @param req      the {@link PasswordChangeRequest} containing old and new passwords
     * @return a message indicating whether the password change succeeded
     * @throws RuntimeException if verification fails or the new password does not meet policy
     */
    @Override
    public String changePassword(String username, PasswordChangeRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        if (passwordEncoder.matches(req.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be same as old");
        }

        if (!isValidPassword(req.getNewPassword())) {
            throw new RuntimeException("Password must be 8+ chars, contain upper, lower, digit");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setFirstLogin(false);  // mark as changed
        user.setPasswordChangedAt(LocalDateTime.now());

        userRepo.save(user);

        return "Password changed successfully";
    }

    private boolean isValidPassword(String password) {
        return password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*");
    }

    @Override
    public String changePasswordFirstLogin(PasswordChangeRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            return "Old password is incorrect";
        }
        if (!isValidPassword(req.getNewPassword())) {
            return "Password must be 8+ chars, contain upper, lower, digit";
        }
        // prevent same password
        if (passwordEncoder.matches(req.getNewPassword(), user.getPassword())) {
            return "New password cannot be same as old";
        }

        log.info("Encoding and updating password for {}", req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setFirstLogin(false);
        user.setPasswordChangedAt(LocalDateTime.now());

        userRepo.save(user);
        return "Password changed successfully";
    }
}
