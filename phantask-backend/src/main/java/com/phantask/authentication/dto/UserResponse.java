package com.phantask.authentication.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserResponse {
    private Long uid;
    private String username;
    private String email;
    private List<String> roles;
    private boolean enabled;
}
