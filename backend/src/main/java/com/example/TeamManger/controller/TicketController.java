package com.example.TeamManger.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEAD')")
    public ResponseEntity<String> createTicket() {
        return ResponseEntity.ok("Ticket created successfully");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    public ResponseEntity<String> updateTicketStatus(@PathVariable Long id) {
        // Assume custom business logic verifies ownership inside the service
        return ResponseEntity.ok("Ticket status updated successfully");
    }
}
