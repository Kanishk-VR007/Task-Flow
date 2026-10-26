package com.example.TeamManger.service;

import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.WebhookEvent;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.repository.WebhookEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AntiGravityService {

    @Autowired
    private Userrepository userRepository;

    @Autowired
    private WebhookEventRepository webhookEventRepository;

    public static final int PR_REVIEW_WEIGHT = 15;

    public void processPendingWebhooks() {
        List<WebhookEvent> pendingEvents = webhookEventRepository.findByStatus("PENDING");
        ObjectMapper mapper = new ObjectMapper();

        for (WebhookEvent event : pendingEvents) {
            try {
                JsonNode root = mapper.readTree(event.getPayload());
                String action = root.has("action") ? root.get("action").asText() : null;
                
                String login = null;
                if (root.has("requested_reviewer") && root.get("requested_reviewer").has("login")) {
                    login = root.get("requested_reviewer").get("login").asText();
                } else if (root.has("review") && root.get("review").has("user") && root.get("review").get("user").has("login")) {
                    login = root.get("review").get("user").get("login").asText();
                } else if (root.has("sender") && root.get("sender").has("login")) {
                    login = root.get("sender").get("login").asText();
                }

                if (action != null && login != null) {
                    Optional<Users> userOpt = userRepository.findByGithubLinkContaining(login);
                    if (userOpt.isPresent()) {
                        Users user = userOpt.get();
                        Integer currentScore = user.getWorkloadScore();
                        if (currentScore == null) {
                            currentScore = 0;
                        }

                        if ("review_requested".equals(action)) {
                            user.setWorkloadScore(currentScore + PR_REVIEW_WEIGHT);
                        } else if ("closed".equals(action) || "submitted".equals(action)) {
                            user.setWorkloadScore(Math.max(0, currentScore - PR_REVIEW_WEIGHT));
                        }

                        userRepository.save(user);
                    }
                }
                
                event.setStatus("PROCESSED");
            } catch (Exception e) {
                event.setStatus("FAILED");
                e.printStackTrace();
            }
            webhookEventRepository.save(event);
        }
    }
}
