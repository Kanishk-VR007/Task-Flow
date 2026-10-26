package com.example.TeamManger.controller;

import com.example.TeamManger.entity.WebhookEvent;
import com.example.TeamManger.repository.WebhookEventRepository;
import com.example.TeamManger.service.AntiGravityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.CompletableFuture;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    @Autowired
    private WebhookEventRepository webhookEventRepository;

    @Autowired
    private AntiGravityService antiGravityService;

    @Value("${github.webhook.secret}")
    private String githubSecret;

    @PostMapping("/github")
    public ResponseEntity<String> handleGithubWebhook(
            @RequestHeader(value = "x-hub-signature-256", required = false) String signature,
            @RequestBody String payload) {

        if (signature == null || !isValidSignature(payload, signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        WebhookEvent event = new WebhookEvent(payload, "PENDING");
        webhookEventRepository.save(event);

        CompletableFuture.runAsync(() -> {
            antiGravityService.processPendingWebhooks();
        });

        return ResponseEntity.ok("Webhook received and queued for processing");
    }

    private boolean isValidSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(githubSecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String expectedSignature = "sha256=" + hexString.toString();
            return expectedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
