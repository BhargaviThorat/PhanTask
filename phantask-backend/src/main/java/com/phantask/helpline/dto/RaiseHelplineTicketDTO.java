package com.phantask.helpline.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RaiseHelplineTicketDTO {

    private String assignedRoleName; // HR, MANAGER, SUPPORT, etc.
    private String description;
    private String priority; // HIGH, MEDIUM, LOW
}
