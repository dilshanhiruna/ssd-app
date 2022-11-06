import { Button, CircularProgress, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "../styles/chat.css";
import io from "socket.io-client";

const API = process.env.REACT_APP_API;

const socket = io.connect(API, {
  transports: ["websocket"],
});

function Chat() {
  let username = "dilshanhiruna";
  let room = "room1";

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const [loadingMsgs, setloadingMsgs] = useState(true);

  useEffect(() => {
    socket.connect();
    if (username !== "") {
      socket.emit("join_room", room);
    }
    //reset the socket.io connection when the student group changes
  }, []);

  useEffect(() => {
    setMessageList([]);
  }, [room]);

  useEffect(() => {
    socket.removeAllListeners();
    //get messages from server at the beginning of the chat
    socket.on("get_messages", (data) => {
      setMessageList(data);
      setloadingMsgs(false);
      console.log(data);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-body">
        {!loadingMsgs ? (
          <ScrollToBottom
            className="message-container"
            initialScrollBehavior="smooth"
          >
            {messageList.map((messageContent, key) => {
              return (
                <div
                  key={key}
                  className="message"
                  id={username !== messageContent.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}&nbsp;</p>
                      <p id="author">
                        {username !== messageContent.author
                          ? messageContent.author
                          : "you"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollToBottom>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70vh",
              }}
            >
              <CircularProgress color="inherit" size={15} />
              <p>&nbsp;&nbsp;Loading messages...</p>
            </div>
          </>
        )}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <span
            style={{
              margin: "0px",
              padding: "0px",
              fontSize: "10px",
              color: "grey",
            }}
          >
            {currentMessage.length + `/ 1000`}
          </span>
        </div>
        <Stack direction="row" spacing={0}>
          <TextField
            error={currentMessage.length > 1000}
            id="outlined-basic"
            variant="outlined"
            fullWidth
            placeholder="Type a message..."
            value={currentMessage}
            sx={{
              background: "#313641",
              borderRadius: "10px",
              marginRight: "10px",
            }}
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <Button
            variant="outlined"
            startIcon={<SendIcon sx={{ marginLeft: "15px" }} />}
            onClick={sendMessage}
            disabled={
              currentMessage === "" ||
              loadingMsgs ||
              currentMessage.length > 1000
            }
          ></Button>
        </Stack>
      </div>
    </div>
  );
}

export default Chat;