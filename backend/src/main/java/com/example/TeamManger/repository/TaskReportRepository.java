package com.example.TeamManger.repository;

import com.example.TeamManger.entity.TaskReport;
import com.example.TeamManger.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskReportRepository extends JpaRepository<TaskReport, Long> {
    List<TaskReport> findByTaskIdOrderByVersionDesc(Long taskId);
    List<TaskReport> findByDeveloperId(Long developerId);

    List<TaskReport> findByCompany(Users company);
    List<TaskReport> findByCompanyId(Long companyId);
    List<TaskReport> findByCompanyIdOrderBySubmissionDateDesc(Long companyId);
    List<TaskReport> findByTaskIdAndCompanyIdOrderByVersionDesc(Long taskId, Long companyId);
    List<TaskReport> findByDeveloperIdAndCompanyId(Long developerId, Long companyId);
    List<TaskReport> findByDeveloperIdAndCompanyIdOrderBySubmissionDateDesc(Long developerId, Long companyId);
}
