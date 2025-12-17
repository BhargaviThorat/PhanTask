package com.phantask.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantask.attendance.entity.Attendance;
import com.phantask.authentication.entity.User;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByUserAndAttendanceDate(User user, LocalDate date);
    boolean existsByUserAndAttendanceDate(User user, LocalDate date);
    boolean existsByUserUidAndAttendanceDate(Long userId, LocalDate date);
    List<Attendance> findByUserAndAttendanceDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate);   
    List<Attendance> findByAttendanceDate(LocalDate date);
    List<Attendance> findByUser(User user);
}
