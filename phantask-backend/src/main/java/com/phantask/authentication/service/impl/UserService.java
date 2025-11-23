package com.phantask.authentication.service.impl;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.entity.UserProfile;
import com.phantask.authentication.repository.RoleRepository;
import com.phantask.authentication.repository.UserProfileRepository;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.service.api.IUserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service that encapsulates user-related business logic.
 *
 * <p>Responsibilities typically include:
 * <ul>
 *   <li>Retrieving user profile information for display</li>
 *   <li>Applying updates to a user's profile</li>
 *   <li>Handling password change requests and related validations</li>
 * </ul>
 *
 * <p>Keep security-sensitive behaviour (password encoding, validation, audit logging)
 * inside this service and avoid exposing implementation details to controllers.
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
                    .orElseThrow(() -> 
                    new UsernameNotFoundException("User not found"));
        
        // DEBUG
        System.out.println("Username: " + username);
        System.out.println("Password hash from DB: " + user.getPassword());
       // BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        //boolean matches = encoder.matches("Admin@123", "$2a$10$JKTb6X/KVNKDm0BgpDh/feYe6vs/OmLcOBwqeh.eRajP75mjLGbmi");
        //System.out.println("Matches? " + matches);
        return new org.springframework.security.core.userdetails.User(
        		 user.getUsername(),
        		    user.getPassword(),
        		    user.getRoles().stream()
        		        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
        		        .collect(Collectors.toList())          
        );
    }

	@Override
    public String createAccount(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        String username = email.substring(0, email.indexOf("@"));
        if (userRepo.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Temp@123"));
        user.setEnabled(true);
        user.setFirstLogin(true);

        Role studentRole = roleRepo.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Role STUDENT not found"));
        user.getRoles().add(studentRole);

        userRepo.save(user);
        return "Student account created successfully. Temporary password: Temp@123 and Username is: "+ username;
    }

	  /**
     * Retrieve the profile for the given username.
     *
     * <p>Expected behaviour:
     * <ol>
     *   <li>Look up the user by username</li>
     *   <li>Map persisted user data into a {@link UserProfile} DTO</li>
     *   <li>Return the DTO or throw an appropriate exception if not found</li>
     * </ol>
     *
     * @param username the username whose profile should be retrieved
     * @return the {@link UserProfile} for the user
     * @throws RuntimeException if the user cannot be found or another retrieval error occurs
     */
	@Override
    public UserProfile getProfile(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return user.getProfile();
    }

	/**
     * Update the profile of the specified user.
     *
     * <p>Expected behaviour:
     * <ul>
     *   <li>Validate incoming data from {@link UpdateProfileRequest}</li>
     *   <li>Persist permitted changes to the user profile</li>
     *   <li>Return a message indicating success or a description of any failure</li>
     * </ul>
     *
     * @param username the username of the user whose profile will be updated
     * @param req the {@link UpdateProfileRequest} containing profile fields to change
     * @return a user-facing message describing the result of the update operation
     * @throws RuntimeException if validation or persistence fails
     */
	@Override
    public String updateProfile(String username, UpdateProfileRequest req) {
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        UserProfile profile = profileRepo.findByUser(user)
            .orElse(new UserProfile());
        
        profile.setUser(user);
        profile.setFullName(req.getFullName());
        profile.setPhone(req.getPhone());
        profile.setDepartment(req.getDepartment());
        profile.setPhotoUrl(req.getPhotoUrl()); 
        profile.setYearOfStudy(req.getYearOfStudy());
        
        profileRepo.save(profile);
        return "Profile updated successfully";
    }

	/**
     * Change the password for the given user.
     *
     * <p>Expected behaviour:
     * <ol>
     *   <li>Verify the supplied current password against stored credentials</li>
     *   <li>Validate the new password against strength and policy rules</li>
     *   <li>Encode and persist the new password; clear first-login flag if applicable</li>
     * </ol>
     *
     * @param username the username of the user requesting the password change
     * @param req the {@link PasswordChangeRequest} containing old and new passwords
     * @return a message indicating whether the password change succeeded
     * @throws RuntimeException if verification fails or the new password does not meet policy
     */
	@Override
    public String changePassword(String username, PasswordChangeRequest req) {
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

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
        user.setFirstLogin(false);  //mark as changed
        user.setPasswordChangedAt(LocalDateTime.now());

        userRepo.save(user);

        return "Password changed successfully";
    }
    
    private boolean isValidPassword(String password) {
        return password.length() >= 8 &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*[a-z].*") &&
               password.matches(".*\\d.*");
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


