import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app); // http server
const wsServer = SocketIO(httpServer);
// socket.io 설치 -> /socket.io/socket.io.js 라는 url을 준다.

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(); // back-end에서 호출하지만 front-end에서 실행된다.
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// 같은 서버에서 http, webSocket 둘 다 작동 시킴
// 현재 http server가 필요한 이유 : views, static files, home, redirection이 필요하기 때문.

// function handleConnection(socket) {
//   console.log(socket); // 연결된 브라우저
// }

// 누가 서버에 연결하면 그 connection을 넣기 위한 용도
/* 
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", () => console.log("disconnected from the Browser ❌"));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
      // socket은 기본적으로 객체이다. socket 안에 정보 저장 가능!
    }
  }); // 각 브라우저를 위한 것이라 socket에 연결. 특정 socket에서 메세지를 받았을 때
  // socket.send() : 서버가 아니라 socket의 메소드!
});
// func은 socket을 받음 : socket은 연결된 어떤 사람. 연결된 브라우저와의 contact 라인.
 */

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

// 서로 다른 브라우저는 서로 메시지를 주고받지 못함
// ex. 크롬과 서버 사이에 websocket이 있고
// firefox와 서버 사이에 websocket이 있다.
// firefox와 크롬이 대화를 하게 하려면 -> 누가 연결되었는지 알아야 함.
