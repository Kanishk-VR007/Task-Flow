package com.example.TeamManger.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.Role;
import org.springframework.stereotype.Service;
import com.example.TeamManger.service.TaskService;
import com.example.TeamManger.entity.Task;
import com.example.TeamManger.repository.Taskrepository;
import com.example.TeamManger.repository.Userrepository;

@Service
public class TaskServiceimpl implements TaskService {
    @Autowired
    Taskrepository obj;
    @Autowired
    Userrepository obj2;

    public Task SaveTask(Task data, String email) {
        Users currentUser = obj2.findByEmail(email);
        if (currentUser == null)
            currentUser = obj2.findByUserName(email);
        if (currentUser == null)
            throw new RuntimeException("User not found");

        if (data.getUser() != null && data.getUser().getId() != null) {
            Users assignee = obj2.findById(data.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            if (currentUser.getRole() == Role.DEVELOPER || currentUser.getRole() == Role.JUNIOR_DEV || currentUser.getRole() == Role.INTERN) {
                if (!assignee.getId().equals(currentUser.getId())) {
                    throw new SecurityException("Developers can only assign tasks to themselves as primary developer");
                }
            }
            data.setUser(assignee);
        } else {
            data.setUser(currentUser);
        }

        if (data.getIntern() != null && data.getIntern().getId() != null) {
            Users intern = obj2.findById(data.getIntern().getId())
                    .orElseThrow(() -> new RuntimeException("Intern not found"));
            if (currentUser.getRole() == Role.DEVELOPER || currentUser.getRole() == Role.JUNIOR_DEV) {
                if (intern.getSupervisor() == null || !intern.getSupervisor().getId().equals(currentUser.getId())) {
                    throw new SecurityException("You can only assign tasks to interns assigned to you");
                }
            } else if (currentUser.getRole() == Role.TEAM_LEAD) {
                if (intern.getTeam() == null || currentUser.getTeam() == null || !intern.getTeam().getId().equals(currentUser.getTeam().getId())) {
                    throw new SecurityException("You can only assign tasks to interns on your team");
                }
            }
            data.setIntern(intern);
        }
        return obj.save(data);
    }

    public Task getTaskById(Long id, String email) {
        Task task = obj.findById(id).orElseThrow(() -> new RuntimeException("No data found"));
        Users user = obj2.findByEmail(email);
        if (user == null)
            user = obj2.findByUserName(email);

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.PROJECT_MANAGER) {
            return task;
        }

        if (user.getRole() == Role.TEAM_LEAD) {
            if (task.getUser() != null && task.getUser().getTeam() != null && user.getTeam() != null &&
                    task.getUser().getTeam().getId().equals(user.getTeam().getId())) {
                return task;
            }
        }

        if (user.getRole() == Role.DEVELOPER || user.getRole() == Role.JUNIOR_DEV) {
            if ((task.getUser() != null && task.getUser().getId().equals(user.getId())) ||
                (task.getIntern() != null && task.getIntern().getSupervisor() != null && task.getIntern().getSupervisor().getId().equals(user.getId()))) {
                return task;
            }
            throw new SecurityException("Unauthorized access to task");
        }

        if (task.getUser() == null || !task.getUser().getId().equals(user.getId())) {
            if (task.getIntern() == null || !task.getIntern().getId().equals(user.getId())) {
                throw new SecurityException("Unauthorized access to task");
            }
        }
        return task;
    }

    public List<Task> getAllTasks(String email) {
        Users foundUser = obj2.findByEmail(email);
        final Users user = (foundUser != null) ? foundUser : obj2.findByUserName(email);

        if (user == null) {
            return java.util.Collections.emptyList();
        }

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.PROJECT_MANAGER) {
            return obj.findAll();
        }

        if (user.getRole() == Role.TEAM_LEAD) {
            if (user.getTeam() == null)
                return obj.findByUser(user);
            return obj.findAll().stream()
                    .filter(task -> task.getUser() != null && task.getUser().getTeam() != null &&
                            task.getUser().getTeam().getId().equals(user.getTeam().getId()))
                    .collect(java.util.stream.Collectors.toList());
        }

        if (user.getRole() == Role.INTERN) {
            return obj.findAll().stream()
                    .filter(task -> (task.getUser() != null && task.getUser().getId().equals(user.getId())) ||
                            (task.getIntern() != null && task.getIntern().getId().equals(user.getId())))
                    .collect(java.util.stream.Collectors.toList());
        }

        if (user.getRole() == Role.DEVELOPER || user.getRole() == Role.JUNIOR_DEV) {
            return obj.findAll().stream()
                    .filter(task -> (task.getUser() != null && task.getUser().getId().equals(user.getId())) ||
                            (task.getIntern() != null && task.getIntern().getSupervisor() != null && task.getIntern().getSupervisor().getId().equals(user.getId())))
                    .collect(java.util.stream.Collectors.toList());
        }

        return obj.findByUser(user);
    }

    public Task UpdateTask(Long id, Task data, String email) {
        Task task = getTaskById(id, email);
        if (data.getTaskName() != null) {
            task.setTaskName(data.getTaskName());
        }
        if (data.getDescription() != null) {
            task.setDescription(data.getDescription());
        }
        if (data.getDomain() != null) {
            task.setDomain(data.getDomain());
        }
        if (data.getPriority() != null) {
            task.setPriority(data.getPriority());
        }
        if (data.getStartTime() != null) {
            task.setStartTime(data.getStartTime());
        }
        if (data.getEndTime() != null) {
            task.setEndTime(data.getEndTime());
        }
        if (data.getCompletionStatus() != null) {
            task.setCompletionStatus(data.getCompletionStatus());
        }
        if (data.getUser() != null && data.getUser().getId() != null) {
            Users assignee = obj2.findById(data.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setUser(assignee);
        }
        if (data.getIntern() != null && data.getIntern().getId() != null) {
            Users intern = obj2.findById(data.getIntern().getId())
                    .orElseThrow(() -> new RuntimeException("Intern not found"));
            Users currentUser = obj2.findByEmail(email);
            if (currentUser == null) currentUser = obj2.findByUserName(email);
            if (currentUser.getRole() == Role.DEVELOPER || currentUser.getRole() == Role.JUNIOR_DEV) {
                if (intern.getSupervisor() == null || !intern.getSupervisor().getId().equals(currentUser.getId())) {
                    throw new SecurityException("You can only assign tasks to interns assigned to you");
                }
            }
            task.setIntern(intern);
        } else if (data.getIntern() == null) {
            // Allow unassigning intern
            task.setIntern(null);
        }
        return obj.save(task);
    }

    public void DeleteTask(Long id, String email) {
        Task task = getTaskById(id, email);
        obj.deleteById(task.getId());
    }
}
