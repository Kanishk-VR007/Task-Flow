package com.example.TeamManger.service;

import com.example.TeamManger.dto.AssignMemberRequest;
import com.example.TeamManger.dto.TeamCreateRequest;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.entity.Team;
import com.example.TeamManger.entity.TeamInvite;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.repository.TeamInviteRepository;
import com.example.TeamManger.repository.TeamRepository;
import com.example.TeamManger.repository.Userrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private Userrepository userRepository;

    @Autowired
    private TeamInviteRepository teamInviteRepository;

    public Team createTeam(TeamCreateRequest request) {
        Users teamLead = userRepository.findByUserName(request.getTeamLeadUsername());
        if (teamLead == null) {
            teamLead = userRepository.findByEmail(request.getTeamLeadUsername());
        }
        
        if (teamLead == null) {
            throw new RuntimeException("Team lead not found");
        }

        if (teamLead.getRole() != Role.TEAM_LEAD && teamLead.getRole() != Role.PROJECT_MANAGER) {
            throw new RuntimeException("User does not have the required role to lead a team.");
        }

        Team team = new Team(request.getTeamName(), request.getDomain(), teamLead);
        return teamRepository.save(team);
    }

    public void assignMemberToTeam(AssignMemberRequest request) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Users member = userRepository.findByUserName(request.getMemberUsername());
        if (member == null) {
            member = userRepository.findByEmail(request.getMemberUsername());
        }

        if (member == null) {
            throw new RuntimeException("Member not found");
        }

        if (member.getRole() == Role.ADMIN || member.getRole() == Role.PROJECT_MANAGER) {
            throw new RuntimeException("Cannot assign ADMIN or PROJECT_MANAGER as a regular team member.");
        }

        if (member.getRole() == Role.INTERN) {
            // Interns get assigned immediately
            member.setTeam(team);
            userRepository.save(member);
        } else if (member.getRole() == Role.DEVELOPER || member.getRole() == Role.JUNIOR_DEV) {
            // Developers and Junior Devs must accept an invite
            TeamInvite invite = new TeamInvite(team, member);
            teamInviteRepository.save(invite);
        }
    }

    public void respondToInvite(Long inviteId, boolean accept) {
        TeamInvite invite = teamInviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (!invite.getStatus().equals("PENDING")) {
            throw new RuntimeException("Invite has already been processed.");
        }

        if (accept) {
            invite.setStatus("ACCEPTED");
            Users user = invite.getInvitee();
            user.setTeam(invite.getTeam());
            userRepository.save(user);
        } else {
            invite.setStatus("REJECTED");
        }
        
        teamInviteRepository.save(invite);
    }
}
