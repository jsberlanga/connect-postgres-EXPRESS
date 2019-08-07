import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("/users");
      setUsers(res.data);
    };
    fetchUsers();
    console.log("object");
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get("/messages");
      setMessages(res.data);
    };
    fetchMessages();
  }, [messages]);

  const messagesFromUser = user => {
    return messages.filter(message => message.userId === user.id);
  };

  return (
    <div className="container">
      <h1>PostgreSQL + Express + React</h1>
      <AddMessage />
      <div>
        {users.map(user => (
          <div key={user.id}>
            <p>
              In our db we have messages from: <b>{user.username}</b>
            </p>
            {messagesFromUser(user).map((message, idx) => (
              <p key={message.id}>
                {idx + 1}.{message.text}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const AddMessage = () => {
  const [value, setValue] = useState("");
  const handleSubmit = async e => {
    e.preventDefault();
    if (value) {
      await axios.post("/messages/add", {
        text: value,
        userId: 1
      });
    }
    setValue("");
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <input type="submit" />
    </form>
  );
};

export default App;
