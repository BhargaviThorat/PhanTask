package com.phantask.task.repository;

import com.phantask.task.entity.TaskEntity;
import com.phantask.task.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

    List<TaskEntity> findByAssignedToUser(String username);

    List<TaskEntity> findByAssignedToRole(String role);

    List<TaskEntity> findByAssignedToUserAndStatus(String username, TaskStatus status);

    List<TaskEntity> findByAssignedToRoleAndStatus(String role, TaskStatus status);
}
