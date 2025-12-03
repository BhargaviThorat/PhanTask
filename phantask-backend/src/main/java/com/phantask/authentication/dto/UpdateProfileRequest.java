package com.phantask.authentication.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

/**
 * DTO for updating a user's profile information.
 *
 * <p>
 * Include only fields that may be changed by the end user. Add validation
 * annotations as needed (for example, @Size, @Email).
 * </p>
 */
@Data
public class UpdateProfileRequest {
	private String fullName;
	private String department;
	private String phone;
	private MultipartFile profilePic;
	private String yearOfStudy;
}
