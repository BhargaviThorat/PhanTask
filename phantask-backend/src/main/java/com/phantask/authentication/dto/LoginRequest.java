package com.phantask.authentication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for authentication (login) requests.
 *
 * <p>
 * This object carries the credentials required to authenticate a user. The
 * username field may represent a username or an email depending on the
 * application's login policy.
 * </p>
 *
 * <p>
 * Note: The password should be handled securely and must not be logged or
 * returned by any API. Consider adding validation annotations (e.g. @NotBlank)
 * and request-level protections such as rate limiting or account lockout on
 * failed attempts.
 * </p>
 */
@Data
public class LoginRequest {
	
	@NotBlank(message = "Username is required")
    private String username;
	
	@NotBlank(message = "Password is required")
    private String password;
}
