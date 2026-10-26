package com.example.TeamManger.service;

import java.util.List;

import com.example.TeamManger.entity.Task;

public interface TaskService {
    public Task SaveTask(Task data, String email);
    public Task getTaskById(Long id, String email);
    public List<Task> getAllTasks(String email);
    public Task UpdateTask(Long id, Task data, String email);
    public void DeleteTask(Long id, String email);
}
