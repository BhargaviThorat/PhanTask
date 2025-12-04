package com.phantask.authentication.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantask.authentication.dto.LoginRequest;
import com.phantask.authentication.service.api.IAuthService;
import com.phantask.authentication.service.impl.AuthService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller that exposes authentication-related endpoints.
 *
 * <p>
 * Exposes endpoints under {@code /api/auth} for:
 * <ul>
 *   <li>login: authenticates a user and returns authentication data (e.g. token and user info)</li>
 *   <li>logout: invalidates or handles logout for the provided authorization header</li>
 *   <li>refresh-token: refreshes an existing token and returns a new one</li>
 * </ul>
 * </p>
 *
 * <p>
 * This controller delegates actual authentication logic to {@link AuthService}.
 * </p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final IAuthService authService;

	/**
	 * Authenticate a user using the provided credentials.
	 *
	 * <p>
	 * Expects a {@link LoginRequest} JSON body containing username/email and
	 * password. Delegates to {@link AuthService#login(LoginRequest)} which should
	 * return a map containing authentication details (for example: token, expiry,
	 * user info).
	 * </p>
	 *
	 * @param req the login request payload (validated)
	 * @return a ResponseEntity containing a map with authentication information
	 */
	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody @Valid LoginRequest req) {
		Map<String, Object> response = authService.login(req);
		return ResponseEntity.ok(response);
	}


	/*
	 * Handles refresh-token requests.
	 *
	 * Steps:
	 * 1. Verify that the Authorization header exists and starts with "Bearer ".
	 * 2. Extract the refresh token from the header.
	 * 3. Pass the token to the service to validate it and generate a new access token.
	 * 4. Return the new access token to the client.
	 *
	 * If the refresh token is expired or invalid,
	 * the user must log in again.
	 */
	@PostMapping("/refresh-token")
	public ResponseEntity<Map<String, String>> refreshToken(@RequestHeader("Authorization") String authHeader) {
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			return ResponseEntity.badRequest().body(Map.of("error", "Invalid Authorization header"));
		}
		try {
			String refreshToken = authHeader.substring(7);
			String newToken = authService.refreshToken(refreshToken);
			return ResponseEntity.ok(Map.of("accessToken", newToken));
		} catch (ExpiredJwtException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Refresh token has expired"));
		} catch (JwtException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid token"));
		}
	}
	
	/**
     * Resolve the identity associated with the supplied {@code Authorization}
     * header.
     *
     * <p>
     * This endpoint is intended for single‑page applications that need to
     * validate a stored access token on startup (for example, after a page
     * refresh) and recover lightweight user information. The method:
     * </p>
     * <ul>
     *   <li>Expects a header {@code Authorization: Bearer &lt;jwt&gt;}</li>
     *   <li>Parses and validates the token using {@link AuthService}</li>
     *   <li>Returns a small JSON object with fields such as
     *       {@code username}, {@code roles}, and {@code enabled}</li>
     * </ul>
     *
     * @param authHeader the HTTP {@code Authorization} header containing a
     *                   bearer token
     * @return {@code 200 OK} with basic user details if the token is valid;
     *         {@code 401 Unauthorized} if the token is missing, invalid or
     *         expired
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);

        try {
            Map<String, Object> profile = authService.getCurrentUserProfile(token);
            return ResponseEntity.ok(profile);
        } catch (ExpiredJwtException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token expired"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token"));
        }
    }
}
