const socket = io();

// Join chatroom
socket.emit('join', { username, room });

// Message from server
socket.on('message', message => {
  outputMessage(message);
});

socket.on('update active users', (users) => {
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = users.map(user => `
    <li>
      <img src="${user.avatar ? `/uploads/${user.avatar}` : '/images/default-avatar.png'}" alt="${user.username}" class="avatar">
      <span>${user.username}</span>
    </li>
  `).join('');
});

socket.on('user joined', (username, room) => {
  if (room === 'General') {
    const messagesDiv = document.getElementById('chat-messages');
    messagesDiv.innerHTML += `<p><em>${username} has joined the chat room</em></p>`;
  }
});

socket.on('user left', (username, room) => {
  if (room === 'General') {
    const messagesDiv = document.getElementById('chat-messages');
    messagesDiv.innerHTML += `<p><em>${username} has left the chat room</em></p>`;
  }
});

socket.on('update avatar', (user) => {
  if (user.username === username) {
    const avatarElement = document.querySelector('.chat-header .avatar');
    avatarElement.src = user.avatar ? `/uploads/${user.avatar}` : '/images/default-avatar.png';
  }
});

// Message submit
document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit('sendMessage', { text: msg, user: username }, room, () => {
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.user} <span>${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
document.getElementById('room-name').innerText = room;

// Add users to DOM
function outputUsers(users) {
  document.getElementById('users').innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

