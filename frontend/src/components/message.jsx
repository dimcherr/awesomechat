import React, { Component } from "react";
import moment from "moment";

class Message extends Component {
  formatDate = date => moment(date).format("HH:mm:ss");

  render() {
    const { fromUser, text, date } = this.props.message;
    return (
      <div className="message-container">
        <div className="message-body">
          <div className="message-sender">{fromUser.name}</div>
          <div className="message-text">{text}</div>
        </div>
        <div className="message-date">{this.formatDate(date)}</div>
      </div>
    );
  }
}

export default Message;
