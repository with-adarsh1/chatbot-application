package com.example.whatsapps.controller;

import com.example.whatsapps.service.OpenRouterService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final OpenRouterService openRouterService;

    public ChatController(OpenRouterService openRouterService) {
        this.openRouterService = openRouterService;
    }

    // 🧠 For normal text messages
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public String chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        return openRouterService.getChatResponse(message);
    }

    // 🖼️ For image/file uploads
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String handleFileUpload(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("message") String message) throws IOException {

        StringBuilder response = new StringBuilder();

        // If a file is uploaded
        if (file != null && !file.isEmpty()) {
            response.append("📎 File received:\n");
            response.append("Name: ").append(file.getOriginalFilename()).append("\n");
            response.append("Type: ").append(file.getContentType()).append("\n");
            response.append("Size: ").append(file.getSize()).append(" bytes\n\n");
        }

        // Process message with OpenRouter AI service
        String aiResponse = openRouterService.getChatResponse(message);
        response.append("🤖 AI says: ").append(aiResponse);

        return response.toString();
    }
}
