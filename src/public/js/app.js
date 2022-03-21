const socket = io();
// io : 자동적으로 back-end socket.io와 연결해주는 function
// 알아서 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You : ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  // callback : 서버로부터 실행되는 function
  // 특정한 이벤트를 emit 할 수 있다. emit 하면 argument 보낼 수 있음.
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

/* 
  1. socketIO를 이용하면 모든 것이 message일 필요가 없다.
  2. 어떠한 event든 emit 가능
  3. 전송할 때 원하는 아무거나 전송 가능, 개수도 여러 개 가능
  4. function : 끝날 때 실행되는 함수를 보내고 싶으면 마지막 인수에 넣는다.
  */

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left!`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  // 한 번 실행할 때 화면이 방의 목록을 그려준다.
  // 다시 한 번 실행할 때 (room) 목룍이 비어있으면 아무것도 하지 않는다.
  // 하지만 이미 그려둔 것은 유지되는 상황. -> if문으로 확인

  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
