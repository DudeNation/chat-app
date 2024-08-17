const socket = io();

// Join chatroom
socket.emit('join', { username, room });

// Message from server
socket.on('message', message => {
  outputMessage(message);
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

