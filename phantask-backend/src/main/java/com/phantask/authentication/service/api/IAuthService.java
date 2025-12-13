package com.phantask.authentication.service.api;

import java.util.Map;

import com.phantask.authentication.dto.LoginRequest;

public interface IAuthService {
	Map<String, Object> login(LoginRequest req);

	String refreshToken(String refreshToken);
	
	public Map<String, Object> getCurrentUserProfile(String token);
}
