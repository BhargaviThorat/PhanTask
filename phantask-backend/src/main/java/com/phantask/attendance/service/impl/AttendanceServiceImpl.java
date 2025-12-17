package com.phantask.attendance.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.phantask.attendance.entity.Attendance;
import com.phantask.attendance.entity.AttendanceToken;
import com.phantask.attendance.repository.AttendanceRepository;
import com.phantask.attendance.repository.AttendanceTokenRepository;
import com.phantask.attendance.service.IAttendanceService;
import com.phantask.authentication.entity.User;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.exception.AttendanceAlreadyMarkedException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements IAttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final AttendanceTokenRepository tokenRepo;
    private final UserRepository userRepo;

    @Override
    @Transactional
    public void registerQrToken(String token) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();

        boolean attendanceExists =
                attendanceRepo.existsByUserUidAndAttendanceDate(user.getUid(), LocalDate.now());

        if (attendanceExists) {
        	throw new AttendanceAlreadyMarkedException("Attendance already marked for today");
        }

        AttendanceToken attendanceToken = new AttendanceToken();
        attendanceToken.setToken(token);
        attendanceToken.setUser(user);
        attendanceToken.setDate(today);
        attendanceToken.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        attendanceToken.setUsed(false);

        tokenRepo.save(attendanceToken);
    }

    @Override
    @Transactional
    public Attendance markAttendance(String token) {

        AttendanceToken attendanceToken = tokenRepo
        		.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or used QR token"));

        if (attendanceToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("QR token expired");
        }

        User user = attendanceToken.getUser();
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepo
                .findByUserAndAttendanceDate(user, today)
                .orElse(null);

        if (attendance == null) {
            attendance = new Attendance();
            attendance.setUser(user);
            attendance.setAttendanceDate(today);
            attendance.setCheckInTime(LocalDateTime.now());
            attendance.setStatus("CHECKED_IN");
        } else if (attendance.getCheckOutTime() == null) {
            attendance.setCheckOutTime(LocalDateTime.now());
            attendance.setStatus("CHECKED_OUT");
        } else {
            throw new RuntimeException("Attendance already completed");
        }

        attendanceToken.setUsed(true);
        log.info("Attendance marked for {}", user.getUsername());
        
        tokenRepo.save(attendanceToken);
        return attendanceRepo.save(attendance);
    }

    @Override
    public List<Attendance> getMyAttendance() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return attendanceRepo.findByUser(user);
    }

}
