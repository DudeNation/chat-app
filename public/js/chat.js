const socket = io();
const username = '<%= user.username %>';
const avatar = '<%= user.avatar %>';
const room = 'General'; // Default room
let currentRoom = room;

// Emit user connected event
socket.emit('user connected', { username, avatar });

// Listen for messages from the server
socket.on('chat message', (data) => {
  const messagesDiv = document.getElementById('chat-messages');
  let messageContent = `<p><strong>${data.username}:</strong> ${data.message.text}</p>`;
  if (data.message.file) {
    messageContent += `<img src="${data.message.file}" alt="Uploaded image" style="max-width: 200px;">`;
  }
  messagesDiv.innerHTML += `
    <div class="message ${data.username === username ? 'sent' : 'received'}">
      <img src="${data.avatar || '/images/default-avatar.png'}" alt="${data.username}" class="avatar">
      ${messageContent}
    </div>
  `;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Message submit
document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg').value;
  const fileInput = document.getElementById('file-upload');

  if (msg || fileInput.files.length > 0) {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        socket.emit('chat message', { text: msg, file: e.target.result }, currentRoom);
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit('chat message', { text: msg }, currentRoom);
    }
    document.getElementById('msg').value = '';
    fileInput.value = '';
  }
});
