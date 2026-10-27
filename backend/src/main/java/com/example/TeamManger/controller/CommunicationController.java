package com.example.TeamManger.controller;

import com.example.TeamManger.dto.MessageRequestDto;
import com.example.TeamManger.entity.ChannelType;
import com.example.TeamManger.entity.CommunicationLog;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.repository.CommunicationLogRepository;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.service.CommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class CommunicationController {

    @Autowired
    private CommunicationService communicationService;

    @Autowired
    private CommunicationLogRepository communicationLogRepository;

    @Autowired
    private Userrepository userRepository;

    @Autowired
    private com.example.TeamManger.repository.TeamRepository teamRepository;

    @Autowired
    private com.example.TeamManger.repository.Taskrepository taskRepository;

    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : null;
        if (username == null) return null;
        Users user = userRepository.findByUserName(username);
        return user != null ? user : userRepository.findByEmail(username);
    }

    private Users getCompanyForUser(Users u) {
        if (u == null) return null;
        if (u.getCompanyPm() != null) return u.getCompanyPm();
        if (u.getRole() == Role.PROJECT_MANAGER) return u;
        if (u.getTeam() != null && u.getTeam().getProjectManager() != null) return u.getTeam().getProjectManager();
        return u;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageRequestDto dto) {
        Users user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            communicationService.sendMessage(user.getEmail(), dto.getChannelType(), dto.getTeamId(), dto.getTaskId(), dto.getContent());
            return ResponseEntity.ok("Message sent successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/global-leads")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<?> getLeadChat() {
        Users currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        Users company = getCompanyForUser(currentUser);
        Long companyId = company != null ? company.getId() : currentUser.getId();

        List<CommunicationLog> logs = communicationLogRepository.findByChannelTypeAndCompanyIdOrderByTimestampAsc(ChannelType.LEAD_GLOBAL, companyId);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    public ResponseEntity<?> postTeamChat(@PathVariable Long teamId, @RequestBody MessageRequestDto dto) {
        Users user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        Users company = getCompanyForUser(user);
        Long companyId = company != null ? company.getId() : user.getId();

        com.example.TeamManger.entity.Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) return ResponseEntity.notFound().build();

        if (team.getProjectManager() != null && !team.getProjectManager().getId().equals(companyId)) {
            return ResponseEntity.status(403).body("Unauthorized: Team belongs to another company");
        }

        if (user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
            return ResponseEntity.status(403).body("Unauthorized: You do not belong to this team");
        }
        
        try {
            communicationService.sendMessage(user.getEmail(), ChannelType.INTER_TEAM, teamId, null, dto.getContent());
            return ResponseEntity.ok("Message sent successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN', 'PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getTeamChat(@PathVariable Long teamId) {
        Users user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        Users company = getCompanyForUser(user);
        Long companyId = company != null ? company.getId() : user.getId();

        com.example.TeamManger.entity.Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) return ResponseEntity.notFound().build();

        if (team.getProjectManager() != null && !team.getProjectManager().getId().equals(companyId)) {
            return ResponseEntity.status(403).body("Unauthorized: Team belongs to another company");
        }

        if (user.getRole() != Role.PROJECT_MANAGER && user.getRole() != Role.ADMIN) {
            if (user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
                return ResponseEntity.status(403).body("Unauthorized: You do not belong to this team");
            }
        }

        List<CommunicationLog> logs = communicationLogRepository.findByChannelTypeAndTeamIdAndCompanyIdOrderByTimestampAsc(ChannelType.INTER_TEAM, teamId, companyId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN', 'PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getTaskChat(@PathVariable Long taskId) {
        Users user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        Users company = getCompanyForUser(user);
        Long companyId = company != null ? company.getId() : user.getId();

        com.example.TeamManger.entity.Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return ResponseEntity.notFound().build();

        if (task.getCompany() != null && !task.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).body("Unauthorized: Task belongs to another company");
        }

        List<CommunicationLog> logs = communicationLogRepository.findByChannelTypeAndTaskIdAndCompanyIdOrderByTimestampAsc(ChannelType.TASK_COLLABORATION, taskId, companyId);
        return ResponseEntity.ok(logs);
    }
}
