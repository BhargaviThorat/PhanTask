package com.phantask.attendance.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.phantask.authentication.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "attendance",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"uid", "attendance_date"})
    })
@Getter
@Setter
public class Attendance {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uid", nullable = false)
    private User user;
    
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;
    
    /**
     * CHECKED_IN / CHECKED_OUT / ABSENT / LEAVE / WFH
     */
    @Column(nullable = false)
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "marked_by")
    private User markedBy;
}
