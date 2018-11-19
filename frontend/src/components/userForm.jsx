import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";

class UserForm extends Form {
  state = {
    data: { username: "" },
    errors: {}
  };

  schema = {
    username: Joi.string()
      .required()
      .regex(/^[A-Za-z.!@?#"$%&:;() *\+,\/;\-=[\\\]\^_{|}<>\u0400-\u04FF0-9]*$/)
      .min(3)
      .max(64)
      .label("Nickname")
  };

  doSubmit = () => {
    const { username } = this.state.data;
    this.props.onSubmit(username);
    this.setState({data: {username: ""}});
  };

  render() {
    return (
      <form className="m-4" onSubmit={this.handleSubmit}>
        {this.renderInput("username", "", {
          autoFocus: true,
          placeholder: "Enter your nickname",
        })}
        {this.renderButton("Enter chat")}
      </form>
    );
  }
}

export default UserForm;
