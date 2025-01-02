// ChatMessage.java
package com.example.chatappjava;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {
    private String user;
    private String content;
    private String roomId;

    public ChatMessage() {
    }

    public ChatMessage(String user, String content, String roomId) {
        this.user = user;
        this.content = content;
        this.roomId = roomId;
    }
}