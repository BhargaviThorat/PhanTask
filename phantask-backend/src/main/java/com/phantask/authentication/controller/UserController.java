package com.phantask.authentication.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantask.authentication.dto.AccountCreationResponse;
import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.RegisterRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.dto.UserProfileResponse;
import com.phantask.authentication.dto.UserResponse;
import com.phantask.authentication.entity.UserProfile;
import com.phantask.authentication.service.api.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller that exposes user-related end-points.
 *
 * <p>
 * Provides end-points to:
 * <ul>
 *   <li>Create a user account with a temporary password</li>
 *   <li>Retrieve the authenticated user's profile</li>
 *   <li>Update the authenticated user's profile</li>
 *   <li>Change the authenticated user's password</li>
 * </ul>
 * </p>
 * 
 * <p>
 * NOTE:
 * Authorization rules are primarily enforced at the service layer
 * using {@code @PreAuthorize} to guarantee security even if controller
 * methods are reused or called indirectly.
 * </p>
 *
 * <p>
 * All end-points are prefixed with "/api/users".
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
	private final IUserService userService;
	
	/**
	 * Create a new user account with a temporary password.
	 *
	 * @param req a {@link RegisterRequest} containing user-name and email for the
	 *            new user
	 * @return 200 OK with a success message and the temporary password when
	 *         creation succeeds; 400 Bad Request when the user-name already exists
	 * @throws RuntimeException if the "USER" role cannot be found in the
	 *                          database
	 */
	@PreAuthorize("isAuthenticated()")
	@PostMapping("/create-account")
	public ResponseEntity<?> createAccount(@RequestBody RegisterRequest req) {
		String email = req.getEmail();

		if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
			return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
		}
		
		try {
	        String role = req.getRole();
	        AccountCreationResponse response = userService.createAccount(email, role);
	        return ResponseEntity.ok(response);

	    } catch (IllegalArgumentException ex) {
	        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
	    } catch (RuntimeException ex) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(Map.of("error", ex.getMessage()));
	    }
	}

	/**
	 * Deactivate an active user account.
	 *
	 * <p>
	 * This operation is restricted to ADMIN users.
	 * Authorization is enforced at the service layer.
	 * </p>
	 */
    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok(
                Map.of("message", "User account deactivated successfully")
        );
    }

    /**
     * Reactivate a previously deactivated user account.
     *
     * <p>
     * Only users that are currently inactive can be reactivated.
     * Authorization is enforced at the service layer.
     * </p>
     */
    @PutMapping("/{userId}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long userId) {
    	userService.reactivateUser(userId);
    	return ResponseEntity.ok(
    			Map.of("message", "User account reactivated successfully")
    			);
    }

    /**
     * Retrieve all active (enabled) users.
     *
     * <p>
     * Typically used for administrative user management screens.
     * Access is restricted to ADMIN users at the service layer.
     * </p>
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getAllActiveUsers() {
        return ResponseEntity.ok(userService.getAllActiveUsers());
    }

    /**
     * Retrieve all inactive (disabled) users.
     *
     * <p>
     * Useful for administrative actions such as reactivation.
     * Access is restricted to ADMIN users at the service layer.
     * </p>
     */
    @GetMapping("/inactive")
    public ResponseEntity<List<UserResponse>> getAllInactiveUsers() {
    	return ResponseEntity.ok(userService.getAllInactiveUsers());
    }
    
    /**
     * Change password during first login.
     *
     * <p>
     * This endpoint is intentionally accessible without authentication
     * because the user is required to change a temporary password
     * before completing login.
     * </p>
     */
	@PostMapping("/change-password-first-login")
	public ResponseEntity<String> changePasswordFirstLogin(@RequestBody PasswordChangeRequest req) {
		return ResponseEntity.ok(userService.changePasswordFirstLogin(req));
	}

	/**
	 * Retrieve the profile of the currently authenticated user.
	 *
	 * @param auth the Spring Security {@link Authentication} object for the current
	 *             request
	 * @return 200 OK with the {@link UserProfile} of the authenticated user
	 */
	@GetMapping("/profile")
	public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
		return ResponseEntity.ok(userService.getProfile(auth.getName()));
	}

	/**
	 * Update the profile for the currently authenticated user.
	 *
	 * @param auth the Spring Security {@link Authentication} object for the current
	 *             request
	 * @param req  an {@link UpdateProfileRequest} containing profile fields to
	 *             update
	 * @return 200 OK with a message describing the result of the update operation
	 */
	@PostMapping(value = "/update-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> updateProfile(
	        Authentication auth,
	        @ModelAttribute UpdateProfileRequest req) {

	    return ResponseEntity.ok(userService.updateProfile(auth.getName(), req));
	}


	/**
	 * Change the password for the currently authenticated user.
	 *
	 * @param auth the Spring Security {@link Authentication} object for the current
	 *             request
	 * @param req  a {@link PasswordChangeRequest} containing the old and new
	 *             passwords
	 * @return 200 OK with a message describing the result of the password change
	 */
	@PostMapping("/change-password")
	public ResponseEntity<String> changePassword(Authentication auth, @RequestBody PasswordChangeRequest req) {
		return ResponseEntity.ok(userService.changePassword(auth.getName(), req));
	}
}
