// ChatRoom.java
package com.example.chatappjava;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoom {
    private String id;
    private String name;

    public ChatRoom() {
    }

    public ChatRoom(String id, String name) {
        this.id = id;
        this.name = name;
    }
}