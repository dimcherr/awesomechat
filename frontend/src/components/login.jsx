import React, { Component } from "react";
import UserForm from "./userForm";
import { emitCreateRoom } from "../services/socketManager";

class Login extends Component {
  handleCreateRoom = ({room, user}) => {
    if (room.id) {
      this.props.onLogin({user, room});
      this.props.history.push("/chat/" + room.id);
    }
  };

  handleSubmit = username => {
    emitCreateRoom({name: username}, this.handleCreateRoom);
  };

  render() {
    return (
      <div className="m-4">
        <h1>Login</h1>
        <UserForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

export default Login;
