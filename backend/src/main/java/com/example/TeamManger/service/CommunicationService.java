package com.example.TeamManger.service;

import com.example.TeamManger.entity.ChannelType;
import com.example.TeamManger.entity.CommunicationLog;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.repository.CommunicationLogRepository;
import com.example.TeamManger.repository.Userrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommunicationService {

    @Autowired
    private CommunicationLogRepository communicationLogRepository;

    @Autowired
    private Userrepository userRepository;

    @Autowired
    private com.example.TeamManger.repository.Taskrepository taskRepository;

    public void sendMessage(String username, ChannelType type, Long teamId, Long taskId, String content) {
        Users user = userRepository.findByUserName(username);
        if (user == null) {
            user = userRepository.findByEmail(username);
        }
        
        if (user == null) {
            throw new SecurityException("User not found");
        }

        if (type == ChannelType.LEAD_GLOBAL) {
            if (user.getRole() != Role.TEAM_LEAD && user.getRole() != Role.PROJECT_MANAGER && user.getRole() != Role.ADMIN) {
                throw new SecurityException("Unauthorized: Only Leads can access global chat");
            }
        } else if (type == ChannelType.INTER_TEAM) {
            if (user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
                throw new SecurityException("Unauthorized: You do not belong to this team");
            }
        } else if (type == ChannelType.TASK_COLLABORATION) {
            com.example.TeamManger.entity.Task task = taskRepository.findById(taskId).orElse(null);
            if (task == null) throw new SecurityException("Task not found");
            
            boolean isAssigned = (task.getUser() != null && task.getUser().getId().equals(user.getId()));
            boolean isIntern = (task.getIntern() != null && task.getIntern().getId().equals(user.getId()));
            boolean isTeamLead = (user.getRole() == Role.TEAM_LEAD && user.getTeam() != null && task.getUser() != null && task.getUser().getTeam() != null && task.getUser().getTeam().getId().equals(user.getTeam().getId()));
            boolean isPM = (user.getRole() == Role.PROJECT_MANAGER || user.getRole() == Role.ADMIN);
            
            if (!isAssigned && !isIntern && !isTeamLead && !isPM) {
                throw new SecurityException("Unauthorized: You do not have access to this private task chat");
            }
        }

        CommunicationLog log = new CommunicationLog();
        log.setSender(user);
        log.setChannelType(type);
        log.setTeamId(type == ChannelType.INTER_TEAM ? teamId : null);
        log.setTaskId(type == ChannelType.TASK_COLLABORATION ? taskId : null);
        log.setContent(content);
        communicationLogRepository.save(log);
    }
}
