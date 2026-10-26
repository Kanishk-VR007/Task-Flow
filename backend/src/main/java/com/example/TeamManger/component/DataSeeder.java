package com.example.TeamManger.component;

import com.example.TeamManger.entity.*;
import com.example.TeamManger.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private Userrepository userRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private Taskrepository taskRepository;
    @Autowired private ProjectRepository projectRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        System.out.println("Seeding mock data for TaskFlow...");

        // 1. Create Teams
        Team team1 = new Team(); team1.setTeamName("Team 1");
        Team team2 = new Team(); team2.setTeamName("Team 2");
        teamRepository.saveAll(Arrays.asList(team1, team2));

        // 2. Create Project Manager
        Users pm = new Users();
        pm.setFullName("Priya Sharma");
        pm.setUserName("Priya");
        pm.setEmail("priya@taskflow.com");
        pm.setRole(Role.PROJECT_MANAGER);
        pm.setFpassword(com.example.TeamManger.util.HashUtil.hashSHA256("password"));
        pm.setCpassword(com.example.TeamManger.util.HashUtil.hashSHA256("password"));
        userRepository.save(pm);

        // 3. Create Team 1 Lead and Members
        Users lead1 = createMember("Arun Kumar", "Arun", "arun@taskflow.com", Role.TEAM_LEAD, team1, "BACKEND", "");
        Users dev1_1 = createMember("Karthik Raj", "Karthik", "karthik@taskflow.com", Role.DEVELOPER, team1, "BACKEND", "DATABASE,DEVOPS");
        Users dev1_2 = createMember("Rahul Sharma", "Rahul", "rahul@taskflow.com", Role.DEVELOPER, team1, "FRONTEND", "UI_UX");
        Users dev1_3 = createMember("Vijay Kumar", "Vijay", "vijay@taskflow.com", Role.DEVELOPER, team1, "FRONTEND", "");
        Users dev1_4 = createMember("Sanjay Rao", "Sanjay", "sanjay@taskflow.com", Role.DEVELOPER, team1, "DATABASE", "");
        Users jdev1_1 = createMember("Naveen Kumar", "Naveen", "naveen@taskflow.com", Role.JUNIOR_DEV, team1, "FRONTEND", "");
        Users jdev1_2 = createMember("Ajay Raj", "Ajay", "ajay@taskflow.com", Role.JUNIOR_DEV, team1, "BACKEND", "");
        Users jdev1_3 = createMember("Rohit Kumar", "Rohit", "rohit@taskflow.com", Role.JUNIOR_DEV, team1, "TESTING", "");
        Users int1_1 = createMember("Aditya", "Aditya", "aditya@taskflow.com", Role.INTERN, team1, "FRONTEND", "");
        Users int1_2 = createMember("Manoj", "Manoj", "manoj@taskflow.com", Role.INTERN, team1, "BACKEND", "");
        Users int1_3 = createMember("Surya", "Surya", "surya@taskflow.com", Role.INTERN, team1, "TESTING", "");

        // Assign Interns to Supervisor (Karthik)
        int1_1.setSupervisor(dev1_1);
        int1_2.setSupervisor(dev1_1);
        userRepository.saveAll(Arrays.asList(int1_1, int1_2));
        dev1_1.setMentoringWorkload(15);
        userRepository.save(dev1_1);

        // 4. Create Team 2 Lead and Members
        Users lead2 = createMember("Ananya Nair", "Ananya", "ananya@taskflow.com", Role.TEAM_LEAD, team2, "FRONTEND", "");
        Users dev2_1 = createMember("Arjun", "Arjun", "arjun@taskflow.com", Role.DEVELOPER, team2, "MOBILE", "");
        Users dev2_2 = createMember("Harish", "Harish", "harish@taskflow.com", Role.DEVELOPER, team2, "BACKEND", "");
        Users dev2_3 = createMember("Dinesh", "Dinesh", "dinesh@taskflow.com", Role.DEVELOPER, team2, "DATABASE", "");
        Users dev2_4 = createMember("Vivek", "Vivek", "vivek@taskflow.com", Role.DEVELOPER, team2, "DEVOPS", "");
        Users jdev2_1 = createMember("Pranav", "Pranav", "pranav@taskflow.com", Role.JUNIOR_DEV, team2, "MOBILE", "");
        Users jdev2_2 = createMember("Suresh", "Suresh", "suresh@taskflow.com", Role.JUNIOR_DEV, team2, "FRONTEND", "");
        Users jdev2_3 = createMember("Ashwin", "Ashwin", "ashwin@taskflow.com", Role.JUNIOR_DEV, team2, "BACKEND", "");
        Users int2_1 = createMember("Rakesh", "Rakesh", "rakesh@taskflow.com", Role.INTERN, team2, "FRONTEND", "");
        Users int2_2 = createMember("Varun", "Varun", "varun@taskflow.com", Role.INTERN, team2, "DATABASE", "");
        Users int2_3 = createMember("Deepak", "Deepak", "deepak@taskflow.com", Role.INTERN, team2, "MOBILE", "");

        // 5. Create Projects
        Project p1 = new Project(); p1.setName("TaskFlow Platform"); p1.setDescription("Internal tool"); p1.setTeams(Arrays.asList(team1, team2));
        Project p2 = new Project(); p2.setName("E-Commerce Platform"); p2.setDescription("Online store"); p2.setTeams(Arrays.asList(team1));
        Project p3 = new Project(); p3.setName("AI Analytics Platform"); p3.setDescription("Data insights"); p3.setTeams(Arrays.asList(team2));
        Project p4 = new Project(); p4.setName("Mobile Application"); p4.setDescription("iOS/Android App"); p4.setTeams(Arrays.asList(team2));
        projectRepository.saveAll(Arrays.asList(p1, p2, p3, p4));
        
        // 6. Create Tasks (Dummy generator loop for now, we'll assign randomly)
        List<Users> allUsers = Arrays.asList(dev1_1, dev1_2, dev1_3, dev1_4, jdev1_1, jdev1_2, jdev1_3, dev2_1, dev2_2, dev2_3, dev2_4, jdev2_1, jdev2_2, jdev2_3);
        String[] domains = {"FRONTEND", "BACKEND", "DATABASE", "DEVOPS", "TESTING", "MOBILE"};
        String[] priorities = {"LOW", "MEDIUM", "HIGH", "CRITICAL"};
        String[] statuses = {"TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "COMPLETED"};
        
        for (int i = 1; i <= 60; i++) {
            Task t = new Task();
            t.setTaskName("Task " + i);
            t.setDescription("Auto-generated task " + i);
            t.setDomain(domains[i % domains.length]);
            t.setPriority(priorities[i % priorities.length]);
            t.setCompletionStatus(statuses[i % statuses.length]);
            t.setEstimatedHours((double) (4 + (i % 8)));
            t.setActualHours(t.getCompletionStatus().equals("COMPLETED") ? t.getEstimatedHours() * 0.9 : 0.0);
            t.setProgress(t.getCompletionStatus().equals("COMPLETED") ? 100 : (i % 4) * 25);
            t.setStartTime(LocalDateTime.now().minusDays(i % 10));
            t.setEndTime(LocalDateTime.now().plusDays(i % 10));
            t.setUser(allUsers.get(i % allUsers.size()));
            t.setProject(i % 2 == 0 ? p1 : p2);
            taskRepository.save(t);
        }

        System.out.println("Finished seeding organization, projects, and tasks!");
    }

    private Users createMember(String fullName, String userName, String email, Role role, Team team, String primaryDomain, String secondaryDomains) {
        Users u = new Users();
        u.setFullName(fullName);
        u.setUserName(userName);
        u.setEmail(email);
        u.setRole(role);
        u.setTeam(team);
        u.setPrimaryDomain(primaryDomain);
        u.setSecondaryDomains(secondaryDomains);
        u.setFpassword(com.example.TeamManger.util.HashUtil.hashSHA256("password"));
        u.setCpassword(com.example.TeamManger.util.HashUtil.hashSHA256("password"));
        return userRepository.save(u);
    }
}
