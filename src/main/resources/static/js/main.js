var homePage = document.querySelector('#home-page');
var chatPage = document.querySelector('#chat-page');
var heading = document.querySelector("h2");
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageArea = document.querySelector('#messageArea');
var messageInput = document.querySelector('#message');
var connectingElement = document.querySelector('.connection');

var stompClient = null;
var username = null;

var colors = [
    '#FF85AF', '#FF4437', '#CF1A21'
];

function connect(event) {
 username = document.querySelector('#name').value.trim();

 if(username) {
  homePage.classList.add('hidden');
  chatPage.classList.remove('hidden');

  var socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, isConnected, isError);
}
 heading.innerHTML = `Hello ${username}! Welcome to the Pretty Chat😄!`;
 event.preventDefault();
}


function isConnected() {
 stompClient.subscribe('/topic/public', isMessageReceived);

 stompClient.send("/app/chat.addUser",{},
 JSON.stringify({sender: username, type: 'JOIN'}))
 connectingElement.classList.add('hidden');
}


function isError(error) {
 connectingElement.textContent = 'Cannot connect to WebSocket server. Please try again!';
 connectingElement.style.color = '#FF85AF';
}


function sendMessage(event) {
  var messageContent = messageInput.value.trim();

  if(messageContent && stompClient) {
   var chatMessage = {
   sender: username,
   content: messageInput.value,
   type: 'CHAT'
 };

  stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
  messageInput.value = '';
}
  event.preventDefault();
}


function isMessageReceived(payload) {
 var message = JSON.parse(payload.body);

 var messageElement = document.createElement('li');

 if(message.type === 'JOIN') {
  messageElement.classList.add('event-message');
  message.content = message.sender + ' joined!';
 } else if (message.type === 'LEAVE') {
  messageElement.classList.add('event-message');
  message.content = message.sender + ' left!';
 } else {
  messageElement.classList.add('chat-message');

 var avatarElement = document.createElement('i');
 var avatarText = document.createTextNode(message.sender[0]);
 avatarElement.appendChild(avatarText);
 avatarElement.style['background-color'] = getAvatarColor(message.sender);

 messageElement.appendChild(avatarElement);

 var usernameElement = document.createElement('span');
 var usernameText = document.createTextNode(message.sender);
 usernameElement.appendChild(usernameText);
 messageElement.appendChild(usernameElement);
}

 var textElement = document.createElement('p');
 var messageText = document.createTextNode(message.content);
 textElement.appendChild(messageText);

 messageElement.appendChild(textElement);

 messageArea.appendChild(messageElement);
 messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
 var hash = 0;
 for (var i = 0; i < messageSender.length; i++) {
  hash = 31 * hash + messageSender.charCodeAt(i);
}

 var index = Math.abs(hash % colors.length);
 return colors[index];
}

usernameForm.addEventListener('click', connect)
messageForm.addEventListener('click', sendMessage)