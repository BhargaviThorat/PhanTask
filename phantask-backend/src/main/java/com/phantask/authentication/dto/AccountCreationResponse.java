package com.phantask.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AccountCreationResponse {

    private String username;
    private String message;

}