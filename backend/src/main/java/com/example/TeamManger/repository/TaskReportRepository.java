package com.example.TeamManger.repository;

import com.example.TeamManger.entity.TaskReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskReportRepository extends JpaRepository<TaskReport, Long> {
    List<TaskReport> findByTaskIdOrderByVersionDesc(Long taskId);
    List<TaskReport> findByDeveloperId(Long developerId);
}
