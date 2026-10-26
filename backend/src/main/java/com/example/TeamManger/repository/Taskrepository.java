package com.example.TeamManger.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.TeamManger.entity.Task;
import com.example.TeamManger.entity.Users;
import java.util.List;

public interface Taskrepository extends JpaRepository<Task,Long> {
    public List<Task> findByUser(Users user);
}
