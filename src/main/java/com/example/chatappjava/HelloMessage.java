package com.example.chatappjava;

import lombok.Getter;

@Getter
public class HelloMessage {

    private String user;
    private String content;

    public HelloMessage() {
    }

    public HelloMessage(String user, String content) {
        this.user = user;
        this.content =  content;
    }

    public void setName(String user, String content) {
        this.user = user;
        this.content = content;
    }
}