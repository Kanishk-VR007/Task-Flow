package com.example.TeamManger.repository;

import com.example.TeamManger.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
    List<WebhookEvent> findByStatus(String status);
}
