const socket = io();

const chatRoomSelect = document.getElementById('chat-room-select');
const joinRoomBtn = document.getElementById('join-room-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');
const adminChatMessages = document.getElementById('admin-chat-messages');
const adminChatForm = document.getElementById('admin-chat-form');
const adminMessageInput = document.getElementById('admin-message-input');
const adminLog = document.getElementById('admin-log');

let currentRoom = null;

function appendLog(message) {
  const logEntry = document.createElement('div');
  logEntry.innerText = message;
  adminLog.appendChild(logEntry);
  adminLog.scrollTop = adminLog.scrollHeight;
}

socket.on('user joined', (username, room) => {
  appendLog(`User joined: ${username} (Room: ${room})`);
});

socket.on('user left', (username, room) => {
  appendLog(`User left: ${username} (Room: ${room})`);
});

socket.on('admin joined', (username) => {
  const adminChatMessages = document.getElementById('admin-chat-messages');
  const message = document.createElement('div');
  message.classList.add('admin-message');
  message.textContent = `${username} (Admin) has joined the chat room.`;
  adminChatMessages.appendChild(message);
});

socket.on('admin left', (username) => {
  const adminChatMessages = document.getElementById('admin-chat-messages');
  const message = document.createElement('div');
  message.classList.add('admin-message');
  message.textContent = `${username} (Admin) has left the chat room.`;
  adminChatMessages.appendChild(message);
});

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

adminChatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = adminMessageInput.value.trim();
  if (message && currentRoom) {
    socket.emit('chat message', { text: message }, currentRoom);
    adminMessageInput.value = '';
  }
});

socket.emit('admin join', 'admin');

socket.on('chat message', (data) => {
    if (currentRoom === data.room) {
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `
        <div class="message">
          <img src="${data.avatar || '/images/default-avatar.png'}" alt="${data.username}" class="avatar">
          <div class="message-content">
            <p><strong>${data.username}:</strong> ${data.text}</p>
            <span class="timestamp">${new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>
      `;
      adminChatMessages.appendChild(messageElement);
      adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
    }
  });
