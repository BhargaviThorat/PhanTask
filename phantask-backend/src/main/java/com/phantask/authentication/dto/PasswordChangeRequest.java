package com.phantask.authentication.dto;

import lombok.Data;

/**
 * DTO used to request a password change for the authenticated user.
 *
 * <p>The DTO contains the user's current password (for verification) and the requested new password.
 * Depending on policy, you may require the new password to be repeated (confirmNewPassword) and/or
 * enforce password strength rules.
 */
@Data
public class PasswordChangeRequest {
    private String oldPassword;
    private String newPassword;
}
