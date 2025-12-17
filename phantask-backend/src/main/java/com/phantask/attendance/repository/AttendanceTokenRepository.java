package com.phantask.attendance.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantask.attendance.entity.AttendanceToken;
import com.phantask.authentication.entity.User;

public interface AttendanceTokenRepository extends JpaRepository<AttendanceToken, Long> {

    Optional<AttendanceToken> findByTokenAndUsedFalse(String token);
    boolean existsByUserUidAndDate(Long userId, LocalDate date);
    boolean existsByUserAndDate(User user, LocalDate date);
    void deleteByExpiresAtBefore(LocalDateTime now);
}

