package com.phantask.authentication.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Past;
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
    private String photoUrl;
    private String yearOfStudy;
    @Past(message = "DOB must be in the past")
    private LocalDate dob;
}
