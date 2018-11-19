import React, { Component } from "react";
import Message from "./message";
import MessageForm from "./messageForm";
import PerfectScrollbar from "perfect-scrollbar";

class Messenger extends Component {
  constructor(props) {
    super(props);

    this.messageList = React.createRef();
  }

  componentDidMount() {
    this.ps = new PerfectScrollbar(this.messageList.current);
    this.messageList.current.scrollTop = this.messageList.current.scrollHeight;
  }

  componentDidUpdate() {
    if (this.ps) {
      this.messageList.current.scrollTop = this.messageList.current.scrollHeight;
      this.ps.update();
    }
  }

  render() {
    const { onSendMessage, messageList } = this.props;
    return (
      <div className="messenger">
        <ul ref={this.messageList} className="message-list">
          {messageList.map(m => (
            <Message key={m.id} message={m} />
          ))}
        </ul>
        <MessageForm onSendMessage={onSendMessage} />
      </div>
    );
  }
}

export default Messenger;
