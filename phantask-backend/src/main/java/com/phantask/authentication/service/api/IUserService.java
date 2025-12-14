package com.phantask.authentication.service.api;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.phantask.authentication.dto.AccountCreationResponse;
import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.dto.UserProfileResponse;
import com.phantask.authentication.dto.UserResponse;

public interface IUserService extends UserDetailsService {

	AccountCreationResponse createAccount(String email, String roleName);
	UserProfileResponse getProfile(String username);
	String updateProfile(String username, UpdateProfileRequest req);
	String changePassword(String username, PasswordChangeRequest req);
	String changePasswordFirstLogin(PasswordChangeRequest req);
	void deactivateUser(Long userId);
	void reactivateUser(Long userId);
    List<UserResponse> getAllActiveUsers();
    List<UserResponse> getAllInactiveUsers();
}
