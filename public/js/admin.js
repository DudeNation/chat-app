const socket = io();

const chatRoomSelect = document.getElementById('chat-room-select');
const joinRoomBtn = document.getElementById('join-room-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');
const adminChatMessages = document.getElementById('admin-chat-messages');

let currentRoom = null;

joinRoomBtn.addEventListener('click', () => {
  const selectedRoom = chatRoomSelect.value;
  if (selectedRoom) {
    socket.emit('admin join', selectedRoom);
    currentRoom = selectedRoom;
  }
});

leaveRoomBtn.addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('admin leave', currentRoom);
    currentRoom = null;
    adminChatMessages.innerHTML = '';
  }
});

socket.on('chat message', (data) => {
  if (currentRoom === data.room) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
    adminChatMessages.appendChild(messageElement);
  }
});
