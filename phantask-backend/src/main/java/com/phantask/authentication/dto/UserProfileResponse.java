package com.phantask.authentication.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {

	private Long userId;
	private String username;
	private String email;
	private String role;

	private boolean enabled;
	private boolean firstLogin;
	private LocalDateTime passwordChangedAt;
	private Set<String> roles; // To hold all roles' names

	private String fullName;
	private String department;
	private String phone;
	private String photoUrl;
	private String yearOfStudy;
    @Past(message = "DOB must be in the past")
    private LocalDate dob;
}
