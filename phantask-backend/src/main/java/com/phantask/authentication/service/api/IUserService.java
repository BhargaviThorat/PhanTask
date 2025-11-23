package com.phantask.authentication.service.api;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.phantask.authentication.dto.PasswordChangeRequest;
import com.phantask.authentication.dto.UpdateProfileRequest;
import com.phantask.authentication.entity.UserProfile;

public interface IUserService extends UserDetailsService{

    String createAccount(String email);
    UserProfile getProfile(String username);
    String updateProfile(String username, UpdateProfileRequest req);
    String changePassword(String username, PasswordChangeRequest req);
    String changePasswordFirstLogin(PasswordChangeRequest req);
}

