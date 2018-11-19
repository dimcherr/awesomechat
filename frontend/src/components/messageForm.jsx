import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";

class MessageForm extends Form {
  state = {
    data: { message: "" },
    errors: {}
  };

  schema = {
    message: Joi.string()
      .required()
      .min(1)
      .max(5000)
      .trim()
      .label("Message")
  };

  doSubmit = () => {
    const { message } = this.state.data;
    this.props.onSendMessage(message);
    this.setState({ data: { message: "" } });
  };

  render() {
    return (
      <div className="message-form">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("message", "", {
            autoFocus: true,
            placeholder: "Write your message",
            showError: false,
            autoComplete: false,
            className: 'message-input',
            groupClassName: 'message-input-container',
            button: <button className="btn btn-dark control-button"><i className="material-icons">send</i></button>
          })}
        </form>
      </div>
    );
  }
}

export default MessageForm;
