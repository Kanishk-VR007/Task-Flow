package com.example.TeamManger.repository;

import com.example.TeamManger.entity.TeamInvite;
import com.example.TeamManger.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamInviteRepository extends JpaRepository<TeamInvite, Long> {
    List<TeamInvite> findByInviteeAndStatus(Users invitee, String status);
}
