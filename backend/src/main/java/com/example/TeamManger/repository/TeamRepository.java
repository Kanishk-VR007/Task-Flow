package com.example.TeamManger.repository;

import com.example.TeamManger.entity.Team;
import com.example.TeamManger.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByTeamName(String teamName);
    List<Team> findByProjectManagerId(Long projectManagerId);
    List<Team> findByProjectManager(Users projectManager);
}
