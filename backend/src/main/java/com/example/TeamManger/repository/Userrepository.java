package com.example.TeamManger.repository;

import com.example.TeamManger.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface Userrepository extends JpaRepository<Users,Long>{
    public Boolean existsByEmail(String Email);
    public List<Users> findAllByEmail(String Email);
    public List<Users> findAllByUserName(String userName);
    Optional<Users> findByGithubLinkContaining(String githubUsername);
    List<Users> findByCompanyPmIdOrId(Long companyPmId, Long id);
    List<Users> findByCompanyPmId(Long companyPmId);
    List<Users> findByTeamId(Long teamId);

    default Users findByEmail(String email) {
        if (email == null) return null;
        List<Users> list = findAllByEmail(email);
        return list.isEmpty() ? null : list.get(0);
    }

    default Users findByUserName(String userName) {
        if (userName == null) return null;
        List<Users> list = findAllByUserName(userName);
        return list.isEmpty() ? null : list.get(0);
    }
}
