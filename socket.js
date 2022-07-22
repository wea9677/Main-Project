const app = require("./app");
const fs = require("fs");
const {images, Chats, Rooms, users, sequelize, Sequelize } = require("./models");
const { Op } = sequelize;
const socket = require("socket.io-client")("https://mendorong-jeju.com");
const server = require("http").createServer(app);
module.exports = (server, app) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000", "*", "https://mendorong-jeju.co.kr"],
      credentials: true,
    },
  });
  app.set("io", io);
  io.on("connection", (socket) => {
    socket.onAny((event) => {
      
      console.log(`Socket Event:${event}`);
      console.log(io.sockets.adapter);
      
    });
    socket.on("join-room", async (roomId, userId) => {
      const enterRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
      const enterUser = await users.findOne({
        where: { userId: userId }
      });
      console.log(enterRoom.title, "로 입장합니다");
      socket.join(enterRoom.title);
        
      await Chats.create({
        userNickname: null,
        userId: null,
        roomId: null,
        chat: enterUser.dataValues.nickname + "님이 입장하셨습니다.",
        userImg: null,
      });
      
      console.log(enterUser.dataValues.roomUserNickname,"=룸유저닉네임")
//       if (enterRoom.dataValues.hostId != userId || !enterUser.dataValues.roomUserNickname.includes(userId)) {
        if (enterRoom.dataValues.hostId === enterUser.userId) {
          console.log("입장호스트닉네임=", enterUser.dataValues.hostNickname);
          socket.to(enterRoom.title).emit("welcome", enterUser.dataValues.hostNickname);
        } else {
          let nickname = enterUser.dataValues.roomUserNickname[enterUser.dataValues.roomUserNickname - 1]
          console.log("입장유저닉네임=", enterUser.dataValues.nickname);
          socket.to(enterRoom.title).emit("welcome", nickname);
        };
//       }
    });

    socket.on("chat_message", async (messageChat, userId, roomId) => {
      console.log(messageChat, userId, roomId);
      const chatUser = await users.findOne({ where: { userId: userId } });
      const userImg = await images.findOne({ where: { userId: userId } });
      const room = await Rooms.findOne({ where: { roomId: roomId } });
      console.log(Object.values(chatUser), Object.values(userImg), chatUser.dataValues.nickname, userImg.dataValues.userImageURL);
      const newchat = await Chats.create({
        userNickname: chatUser.dataValues.nickname,
        userId: userId,
        roomId: roomId,
        chat: messageChat,
        userImg: userImg.dataValues.userImageURL,
      });
      console.log(room.title);
      socket.to(room.title).emit(
        "message",
        messageChat,
        chatUser.dataValues.nickname,
        userImg.dataValues.userImageURL,
        roomId
      );
    });
    
    socket.on("leave-room", async (roomId, userId) => {
      console.log(roomId);
      const leaveRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
      const leaveUser = await users.findOne({ where: { userId: userId } });

      if (!leaveRoom) {
        res.status(400).send({
          errorMessage: "존재하지 않는 방입니다.",
        });
        return;
      }
      console.log(leaveRoom.title, "에서퇴장합니다");
      socket.leave(leaveRoom.title);
      await Chats.create({
        userNickname: null,
        userId: null,
        roomId: null,
        chat: leaveUser.dataValues.nickname + "님이 퇴장하셨습니다.",
        userImg: null,
      });
      if (leaveRoom.hostId === leaveUser.userId) {
        console.log("퇴장호스트닉네임=", leaveUser.dataValues.hostNickname);
        socket.to(leaveRoom.title).emit("bye", leaveUser.dataValues.hostNickname);
      } else {
        let nickname = leaveUser.dataValues.roomUserNickname[leaveUser.dataValues.roomUserNickname - 1]
        console.log("퇴장유저닉네임=", leaveUser.dataValues.nickname);
        socket.to(leaveRoom.title).emit("bye", nickname);
      };
      if (leaveUser.dataValues.userId == leaveRoom.dataValues.hostId) {
        await Rooms.update({
          hostId: leaveUser.dataValues.userId
        });
      };
      const roomUsersId = leaveRoom.dataValues.roomuserId.filter(
        (roomUsersId) => roomUsersId != leaveUser.dataValues.userId
      );
      const roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
        (roomUsersNickname) => roomUsersNickname != leaveUser.dataValues.nickname
      );
      const roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
        (roomUsersImg) => roomUsersImg != leaveUser.dataValues.userImgURL
      );
      const roomUserNum = roomUsersId.length + 1;
      await Rooms.update(
        { roomuserId: roomUsersId },
        { roomUserNickname: roomUsersNickname },
        { roomUserImg: roomUsersImg },
        { roomUserNum: roomUserNum },
        { where: { roomId: roomId } }
      );
      
      console.log(io.sockets.adapter)
      
     
    })
  
    });
};
