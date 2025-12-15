package com.phantask.authentication.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminEditUserRequest {
	private String fullName;
	private String department;
	private String phone;
	private String yearOfStudy;
	private LocalDate dob;
	private Boolean resetPassword;
}
