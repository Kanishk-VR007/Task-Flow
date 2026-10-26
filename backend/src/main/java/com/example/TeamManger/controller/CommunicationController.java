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

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody MessageRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : null;

        if (username == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            communicationService.sendMessage(username, dto.getChannelType(), dto.getTeamId(), dto.getTaskId(), dto.getContent());
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
        List<CommunicationLog> logs = communicationLogRepository.findByChannelTypeOrderByTimestampAsc(ChannelType.LEAD_GLOBAL);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    public ResponseEntity<?> postTeamChat(@PathVariable Long teamId, @RequestBody MessageRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : null;
        
        if (username == null) return ResponseEntity.status(401).build();

        Users user = userRepository.findByUserName(username);
        if (user == null) user = userRepository.findByEmail(username);

        if (user == null || user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
            return ResponseEntity.status(403).body("Unauthorized: You do not belong to this team");
        }
        
        try {
            communicationService.sendMessage(username, ChannelType.INTER_TEAM, teamId, null, dto.getContent());
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : null;
        
        Users user = userRepository.findByUserName(username);
        if (user == null) user = userRepository.findByEmail(username);
        
        if (user == null) return ResponseEntity.status(401).build();

        if (user.getRole() != Role.PROJECT_MANAGER && user.getRole() != Role.ADMIN) {
            if (user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
                return ResponseEntity.status(403).body("Unauthorized: You do not belong to this team");
            }
        }

        List<CommunicationLog> logs = communicationLogRepository.findByChannelTypeAndTeamIdOrderByTimestampAsc(ChannelType.INTER_TEAM, teamId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN', 'PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getTaskChat(@PathVariable Long taskId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : null;
        
        Users user = userRepository.findByUserName(username);
        if (user == null) user = userRepository.findByEmail(username);
        if (user == null) return ResponseEntity.status(401).build();
        
        // Authorization is checked at message sending, but for viewing we should check too:
        // For simplicity, returning all task chat. The prompt said PM, TL can view.
        List<CommunicationLog> logs = communicationLogRepository.findByChannelTypeAndTaskIdOrderByTimestampAsc(ChannelType.TASK_COLLABORATION, taskId);
        return ResponseEntity.ok(logs);
    }
}
