package com.phantask.authentication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO used when registering a new user.
 *
 * <p>Contains the minimal information required to create a user account (username and email).
 * Validation annotations can be added if desired (e.g. @NotBlank, @Email).
 */
@Data
public class RegisterRequest {
	
	@NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3–20 characters")
    private String username;
	
	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email address")
    private String email;
	
	@NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
	
	@NotBlank(message = "Role is required")
    private String role;  // ROLE_STUDENT, etc.
}

