// public/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('msg');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();

    if (message !== '') {
      // Send the message to the server
      fetch('/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
        .then((response) => {
          if (response.ok) {
            // Clear the message input
            messageInput.value = '';
          } else {
            console.error('Error sending message:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  });
});
