import React, { Component } from "react";
import ListGroup from "./common/listGroup";
import Messenger from "./messenger";
import UserForm from "./userForm";
import StreamGroup from './streamGroup';
import {
  emitSendMessage,
  emitCheckRoom,
  emitJoinRoom,
  setOnBroadcastSendMessageListener
  
} from "../services/socketManager";

class Chat extends Component {
  state = {
    selectedUser: null,
    loaded: false
  };

  handleSendMessage = messageText => {
    const { user, room } = this.props;
    emitSendMessage(room.id, user, {}, messageText);
  };

  handleJoinRoom = ({ room, user }) => {
    if (room.id) {
      this.props.onUpdateUser(user);
      this.props.onUpdateRoom(room);

      this.setState({ loaded: true });
    } else {
      this.props.history.replace("/chat");
    }
  };

  handleUserSelect = selectedUser => {
    this.setState({ selectedUser });
  };

  handleSubmit = username => {
    const { roomId } = this.props.match.params;
    this.setState({ loaded: false });
    emitJoinRoom(roomId, { name: username }, this.handleJoinRoom);
  };

  handleCheckRoom = isRoom => {
    if (isRoom) {
      this.setState({ loaded: true });
    } else {
      this.props.history.replace("/chat");
    }
  };

  componentDidMount() {
    const { user } = this.props;
    const { roomId } = this.props.match.params;

    if (user.id) {
      this.setState({ loaded: true });
    } else {
      emitCheckRoom(roomId, this.handleCheckRoom);
    }

    setOnBroadcastSendMessageListener(newMessage => {
      const { onUpdateRoom, room } = this.props;
      const updatedRoom = { ...room };
      updatedRoom.messages.push(newMessage);
      onUpdateRoom(updatedRoom);
    });
  }

  render() {
    const { selectedUser, loaded, calls } = this.state;
    const { room, user } = this.props;
    const { users } = room;

    if (!loaded) return <div>...</div>;

    if (!user.id) {
      return <UserForm onSubmit={this.handleSubmit} />;
    }

    return (
      <div className="content">
        <div className="user-list">
          <ListGroup
            items={users || []}
            selectedItem={selectedUser}
            onItemSelect={this.handleUserSelect}
          />
        </div>
        <Messenger
          messageList={room.messages}
          onSendMessage={this.handleSendMessage}
        />
        <StreamGroup user={user} room={room} onBroadcastJoinRoom={this.props.onBroadcastJoinRoom} />
      </div>
    );
  }
}

export default Chat;
