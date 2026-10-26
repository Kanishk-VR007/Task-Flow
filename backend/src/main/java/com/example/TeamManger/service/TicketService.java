package com.example.TeamManger.service;

import com.example.TeamManger.entity.Role;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.repository.Userrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    @Autowired
    private Userrepository userRepository;

    public void assignTicket(Long ticketId, Long assigneeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication != null ? authentication.getName() : null;

        if (currentUsername == null) {
            throw new AccessDeniedException("Unauthorized");
        }

        Users currentUser = userRepository.findByUserName(currentUsername);
        if (currentUser == null) currentUser = userRepository.findByEmail(currentUsername);

        Users assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        if (currentUser.getRole() == Role.TEAM_LEAD) {
            if (currentUser.getTeam() == null || assignee.getTeam() == null || 
                !currentUser.getTeam().getId().equals(assignee.getTeam().getId())) {
                throw new AccessDeniedException("Team Leads can only assign tickets to members of their own team.");
            }
        }

        // Logic to actually assign the ticket to the assignee
        // Ticket ticket = ticketRepository.findById(ticketId)...
        // ticket.setAssignee(assignee);
        // ticketRepository.save(ticket);
    }
}
