let currentRoomId = null;

const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/gs-guide-websocket'
});

stompClient.onConnect = (frame) => {
    setConnected(true);
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/greetings', (messages) => {
        showGreeting(JSON.parse(messages.body).content);
    });

    //Chat room part ################################################################################
    stompClient.subscribe('/topic/rooms', (response) => {
        updateRoomList(JSON.parse(response.body));
    });
    stompClient.publish({
        destination: '/app/chat.getRooms'
    });
    //end of Chat room part #########################################################################
};

stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

function setConnected(connected) {
    if (stompClient.connected)
    {
        $("#connect").prop("disabled", connected);
        $("#disconnect").prop("disabled", !connected);
    }
    else {
        $("#connect").prop("disabled", !connected);
        $("#disconnect").prop("disabled", connected);
    }

    if (stompClient.connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#messages").html("");
}

function connect() {
    stompClient.activate();
}

function disconnect() {
    stompClient.deactivate();
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    stompClient.publish({
        destination: "/app/hello",
        body: JSON.stringify({'user': $("#user").val(), 'content': $("#content").val()})
    });
    $("#content").html("");
}

function showGreeting(message) {
    $("#messages").append("<tr><td>" + message + "</td></tr>");
}

window.onload = () => {
    connect();
}

$(function () {
    $("form").on('submit', (e) => e.preventDefault());
    //$( "#connect" ).click(() => connect());
    //$( "#disconnect" ).click(() => disconnect());
    $( "#send" ).click(() => sendName());

    $('#createRoom').click(() => {
        const roomName = $('#roomName').val();
        if (roomName) {
            stompClient.publish({
                destination: '/app/chat.createRoom',
                body: JSON.stringify({
                    name: roomName
                })
            });
            $('#roomName').val('');
        }
    });

    $('#messageForm').on('submit', sendMessage);
});

//Chat room js section #################################################################################################

function updateRoomList(rooms) {
    if (!Array.isArray(rooms)) {
        rooms = [rooms];
    }

    const roomList = $('#roomList');
    rooms.forEach(room => {
        if (!document.getElementById(`room-${room.id}`)) {
            const li = $('<li>')
                .addClass('list-group-item')
                .attr('id', `room-${room.id}`)
                .text(room.name)
                .click(() => joinRoom(room.id, room.name));
            roomList.append(li);
        }
    });
}

function joinRoom(roomId, roomName) {
    // Unsubscribe from previous room if any
    if (currentRoomId && window.roomSubscription) {
        window.roomSubscription.unsubscribe();
    }

    currentRoomId = roomId;
    $('#currentRoom').text(roomName);
    $('#messages').empty();

    console.log(currentRoomId);

    // Subscribe to new room
    window.roomSubscription = stompClient.subscribe(`/topic/rooms/${roomId}`, (message) => {
        const chatMessage = JSON.parse(message.body);
        showMessage(chatMessage);
    });
}

function showMessage(message) {
    const row = $('<tr>').append($('<td>').text(`${message.user}: ${message.content}`));
    $('#messages').append(row);
    const messageArea = document.getElementById('messageArea');
    messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage(event) {
    event.preventDefault();
    if (!currentRoomId) {
        alert('Please join a room first');
        return;
    }

    const messageContent = $('#message').val();
    const user = $('#user').val();

    if (!messageContent || !user) {
        alert('Please enter both name and message');
        return;
    }

    stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
            roomId: currentRoomId,
            user: user,
            content: messageContent
        })
    });

    $('#message').val('');
}