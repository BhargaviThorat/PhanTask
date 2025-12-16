package com.phantask.authentication.service.impl;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.phantask.authentication.dto.AccountCreationResponse;
import com.phantask.authentication.dto.AdminEditUserRequest;
import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.dto.UserProfileResponse;
import com.phantask.authentication.dto.UserResponse;
import com.phantask.authentication.entity.Role;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.entity.UserProfile;
import com.phantask.authentication.repository.RoleRepository;
import com.phantask.authentication.repository.UserProfileRepository;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.authentication.service.api.IUserService;
import com.phantask.notification.email.EmailService;

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
    private final EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

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
    @PreAuthorize("hasRole('ADMIN')")
    public AccountCreationResponse createAccount(String email, String roleName) {

		Set<String> allowedRoles = roleRepo.findAll().stream().map(Role::getRoleName)
				.collect(Collectors.toSet());
		String normalizedRole = roleName.toUpperCase();
		if (!allowedRoles.contains(normalizedRole)) {
			throw new IllegalArgumentException("Invalid role: " + roleName);
		}
         
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

        Role role = roleRepo.findByRoleName(normalizedRole)
                .orElseThrow(() -> new RuntimeException("Role not found: " + normalizedRole));
        user.getRoles().add(role);

        userRepo.save(user);

        log.info("Account created: username={}, role={}", username, normalizedRole);

        try {
            emailService.sendAccountCreationEmail("bkpati2024@gmail.com", username, tempPassword);
        } catch (Exception e) {
            log.error("Email sending failed", e);
        }
        return new AccountCreationResponse(username,
                "User account created successfully. Temporary password is " + tempPassword);
    }

    private String defaultIfNull(String value) {
        return value == null ? "" : value;
    }

    /*
     * Use Case: Display Dashboard/Profile page of the authenticated User
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
      
        LocalDate dob = Optional.ofNullable(profile.getDob())
        		.orElse(LocalDate.of(1900, 1, 1));

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
                defaultIfNull(profile.getYearOfStudy()),    
                dob     
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
            p.setUser(user); 
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
        profile.setDob(req.getDob());
        
        profileRepo.save(profile);
        return "Profile updated successfully";
    }

  
    /* 
    Change password for an authenticated user.

    Steps performed:
    1. Look up the user in the database using the username.
       If the user does not exist, stop and throw an error.
    2. Check whether the old password entered by the user matches 
       the stored password. If it does not match, an error is thrown.
    3. Validate the new password to make sure it follows all password 
       rules (strength, not same as old password, etc.). If invalid, 
       an error is thrown.
    4. If everything is valid, encode the new password and save it 
       to the database. Also clear any "first login" flag if needed.
    5. Finally, return a success message.
    */
    @Override
    public String changePassword(String username, PasswordChangeRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        validateOldPassword(req.getOldPassword(), user.getPassword());
        validateNewPassword(req.getNewPassword(), user.getPassword());

        updatePassword(user, req.getNewPassword());

        return "Password changed successfully";
    }

    //To check current password strength
    private boolean isValidPassword(String password) {
        return password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*");
    }
    
    //To match old password
    private void validateOldPassword(String oldPassword, String encodedPassword) {
        if (!passwordEncoder.matches(oldPassword, encodedPassword)) {
            throw new RuntimeException("Old password is incorrect");
        }
    }

    //To check new password strength and match it with old password
    private void validateNewPassword(String newPassword, String encodedPassword) {
        if (!isValidPassword(newPassword)) {
            throw new RuntimeException("Password must be 8+ chars, contain upper, lower, digit");
        }
        if (passwordEncoder.matches(newPassword, encodedPassword)) {
            throw new RuntimeException("New password cannot be same as old");
        }
    }

    //To finally update the user with new password
    private void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepo.save(user);
    }

    /* 
    This method is used to change the password during a user's first login(unauthenticated).

    What it does:
    1. Fetch the user from the database using the username provided
       inside the request object. If the user does not exist, an error is thrown.
    2. Verify that the old password provided matches the user's current 
       stored password. If it doesn't match, the process stops with an error.
    3. Check the new password against password rules and ensure 
       it is valid and not the same as the old password.
    4. If all validations pass, encode and update the password in the database.
       This step usually also removes the "first login" restriction 
       so the user can continue using the system normally.
    5. Return a message confirming the password change.
    */
    @Override
    public String changePasswordFirstLogin(PasswordChangeRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateOldPassword(req.getOldPassword(), user.getPassword());
        validateNewPassword(req.getNewPassword(), user.getPassword());

        updatePassword(user, req.getNewPassword());
        return "Password changed successfully";
    }
    
    /**
     * Update profile during first login (no authentication required).
     *
     * <p>
     * This method allows a user to update their profile before completing
     * the first login flow. Unlike updateProfile(), this does not require
     * the user to be authenticated.
     * </p>
     *
     * @param username the username identifying the user
     * @param req the {@link UpdateProfileRequest} containing profile fields to update
     * @return a success message
     * @throws RuntimeException if user not found or profile update fails
     */
    @Override
    @Transactional
    public String updateProfileFirstLogin(String username, UpdateProfileRequest req) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure user is in first login state
        if (!user.isFirstLogin()) {
            throw new RuntimeException("Profile update not allowed - user has already completed first login");
        }

        UserProfile profile = profileRepo.findByUser(user).orElseGet(() -> {
            UserProfile p = new UserProfile();
            p.setUser(user);
            return p;
        });

        profile.setFullName(req.getFullName());
        profile.setPhone(req.getPhone());
        profile.setDepartment(req.getDepartment());
        profile.setYearOfStudy(req.getYearOfStudy());
        profile.setDob(req.getDob());
        
        // Handle profile picture if provided
        if (req.getProfilePic() != null && !req.getProfilePic().isEmpty()) {
            try {
                profile.setProfilePic(req.getProfilePic().getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read profile picture", e);
            }
        }

        profileRepo.save(profile);
        log.info("Profile updated for first login user: {}", username);
        
        return "Profile updated successfully";
    }


	@Override
	@PreAuthorize("hasRole('ADMIN')")
	public void deactivateUser(Long userId) {
		User user = userRepo.findByUidAndEnabledTrue(userId)
                .orElseThrow(() -> new RuntimeException("Active user not found: " + userId));

        user.setEnabled(false);
        user.setDeactivatedAt(LocalDateTime.now());

        userRepo.save(user);		
	}

	@Override
	@PreAuthorize("hasRole('ADMIN')")
	public void reactivateUser(Long userId) {
		User user = userRepo.findByUidAndEnabledFalse(userId)
				.orElseThrow(() -> new RuntimeException("Inactive user not found: " + userId));
		
		user.setEnabled(true);
		user.setDeactivatedAt(null);
		
		userRepo.save(user);		
	}

	@Override
	@Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
	public List<UserResponse> getAllActiveUsers() {
		
		return userRepo.findAllByEnabledTrue().stream()
                .map(this::mapToResponse)
                .toList();
	}

	@Override
	@Transactional(readOnly = true)
	@PreAuthorize("hasRole('ADMIN')")
	public List<UserResponse> getAllInactiveUsers() {
		
		return userRepo.findAllByEnabledFalse().stream()
				.map(this::mapToResponse)
				.toList();
	}
	
	//To map User entity to UserResponse DTO
	private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getUid(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream()
                        .map(Role::getRoleName)
                        .toList(),
                user.isEnabled(),
                user.isFirstLogin(),
                user.getCreatedAt(),
                user.getDeactivatedAt()                
        );
    }
	
	/*
	 * This method allows an admin to edit a user's profile and optionally reset their password.
	 * 
	 * What it does:
	 * 1. Fetch the user from the database using the userId.
	 *    If the user does not exist, an error is thrown.
	 * 2. Retrieve the user's profile or create a new one if it doesn't exist.
	 *    The profile is saved immediately to make it managed by JPA.
	 * 3. Update profile fields (fullName, department, phone, yearOfStudy, dob) 
	 *    only if they are provided in the request (not null).
	 * 4. Forcefully set the profile picture to null to remove any existing image.
	 * 5. Save the updated profile to the database.
	 * 6. If resetPassword flag is true:
	 *    - Reset the password to the default temporary password (Temp@123)
	 *    - Set firstLogin flag to true so user must change password on next login
	 *    - Clear the passwordChangedAt timestamp
	 *    - Save the user and flush changes immediately to the database
	 * 7. Return a success message.
	 */
	@Override
	@Transactional
	@PreAuthorize("hasRole('ADMIN')")
	public String editUserByAdmin(Long userId, AdminEditUserRequest req) {
	    log.info("Starting editUserByAdmin for userId: {}", userId);
	    log.info("Request data - resetPassword: {}", req.getResetPassword());

	    User user = userRepo.findById(userId)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    // Update profile - save immediately to make it a managed entity
	    UserProfile profile = profileRepo.findByUser(user).orElseGet(() -> {
	        UserProfile p = new UserProfile();
	        p.setUser(user);
	        user.setProfile(p);
	        return profileRepo.save(p);
	    });

	    // Update profile fields only if provided (not null)
	    if (req.getFullName() != null) {
	        log.info("Updating fullName to: {}", req.getFullName());
	        profile.setFullName(req.getFullName());
	    }
	    if (req.getDepartment() != null) {
	        log.info("Updating department to: {}", req.getDepartment());
	        profile.setDepartment(req.getDepartment());
	    }
	    if (req.getPhone() != null) {
	        log.info("Updating phone to: {}", req.getPhone());
	        profile.setPhone(req.getPhone());
	    }
	    if (req.getYearOfStudy() != null) {
	        log.info("Updating yearOfStudy to: {}", req.getYearOfStudy());
	        profile.setYearOfStudy(req.getYearOfStudy());
	    }
	    if (req.getDob() != null) {
	        log.info("Updating dob to: {}", req.getDob());
	        profile.setDob(req.getDob());
	    }

	    // Forcefully remove profile picture
	    log.info("Setting profile pic to null");
	    profile.setProfilePic(null);

	    UserProfile savedProfile = profileRepo.save(profile);
	    log.info("Profile saved: {}", savedProfile.getUserId());

	    // Reset password if requested
	    log.info("Checking resetPassword flag: {}", req.getResetPassword());
	    if (req.getResetPassword()) {
	        log.info("ENTERING password reset block for user: {}", userId);
	        user.setPassword(passwordEncoder.encode("Temp@123"));
	        user.setFirstLogin(true);
	        user.setPasswordChangedAt(null);
	        User savedUser = userRepo.save(user);
	        userRepo.flush(); // Force immediate commit to database
	        log.info("Password reset complete. FirstLogin set to: {}", savedUser.isFirstLogin());
	    } else {
	        log.info("Password reset SKIPPED - resetPassword was false");
	    }

	    log.info("editUserByAdmin completed successfully for userId: {}", userId);
	    return "User updated successfully";
	}
}