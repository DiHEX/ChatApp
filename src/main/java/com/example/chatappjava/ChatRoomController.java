// ChatRoomController.java
package com.example.chatappjava;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Controller
public class ChatRoomController {
    private final ConcurrentHashMap<String, ChatRoom> chatRooms = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public ChatRoomController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.createRoom")
    @SendTo("/topic/rooms")
    public ChatRoom createRoom(ChatRoom chatRoom) {
        String roomId = UUID.randomUUID().toString();
        chatRoom.setId(roomId);
        chatRooms.put(roomId, chatRoom);
        return chatRoom;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessage message) {
        String sanitizedUser = HtmlUtils.htmlEscape(message.getUser());
        String sanitizedContent = HtmlUtils.htmlEscape(message.getContent());
        String destination = "/topic/rooms/" + message.getRoomId();

        messagingTemplate.convertAndSend(destination,
                new ChatMessage(sanitizedUser, sanitizedContent, message.getRoomId()));
    }

    @MessageMapping("/chat.getRooms")
    @SendTo("/topic/rooms")
    public List<ChatRoom> getRooms() {
        return new ArrayList<>(chatRooms.values());
    }
}