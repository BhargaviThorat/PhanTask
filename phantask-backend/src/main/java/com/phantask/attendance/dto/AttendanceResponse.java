package com.phantask.attendance.dto;

import java.time.LocalDate;

import com.phantask.attendance.entity.Attendance;

import lombok.Getter;

@Getter
public class AttendanceResponse {

    private Long attendanceId;
    private LocalDate date;
    private String username;
    private boolean present;

    public AttendanceResponse(Attendance attendance) {
        this.attendanceId = attendance.getId();
        this.date = attendance.getAttendanceDate();
        this.username = attendance.getUser().getUsername();
        this.present = true;
    }
}
