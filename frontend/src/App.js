import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify";
import Chat from "./components/chat";
import { withRouter } from "react-router-dom";
import _ from "lodash";

import Login from "./components/login";
import {
  setOnServerErrorListener,
  setOnBroadcastDisconnectListener
} from "./services/socketManager";

class App extends Component {
  state = {
    user: {},
    room: {}
  };

  componentDidMount() {
    setOnBroadcastDisconnectListener(this.handleBroadcastDisconnect);

    setOnServerErrorListener(({ message: errorMessage }) => {
      toast.error(errorMessage);
      this.props.history.replace("/chat");
    });
  }

  handleBroadcastJoinRoom = ({room}) => {
    this.setState({ room });
  }

  handleBroadcastDisconnect = ({ userId }) => {
    const room = { ...this.state.room };
    _.remove(room.users, u => u.id === userId);
    this.setState({ room });
  };

  handleLogin = ({ user, room }) => {
    this.setState({ user, room });
  };

  handleUpdateUser = user => {
    this.setState({ user });
  };

  handleUpdateRoom = room => {
    this.setState({ room });
  };

  render() {
    const { user, room } = this.state;

    return (
      <React.Fragment>
        <Switch>
          <Route
            path="/chat/:roomId"
            render={props => (
              <Chat
                {...props}
                onUpdateUser={this.handleUpdateUser}
                onUpdateRoom={this.handleUpdateRoom}
                onBroadcastJoinRoom={this.handleBroadcastJoinRoom}
                user={user}
                room={room}
              />
            )}
          />
          <Route
            path="/chat"
            exact
            render={props => <Login {...props} onLogin={this.handleLogin} />}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withRouter(App);
