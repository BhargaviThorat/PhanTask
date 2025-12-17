package com.phantask.attendance.service;

import java.util.List;

import com.phantask.attendance.entity.Attendance;

public interface IAttendanceService {

	void registerQrToken(String token);
	Attendance markAttendance(String token);
	List<Attendance> getMyAttendance();
}
