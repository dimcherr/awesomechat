import React, { Component } from "react";
import Input from "./input";
import Joi from "joi-browser";

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);

    if (!error) return null;

    const errors = {};
    for (let item of error.details) {
      errors[item.path[0]] = item.message.replace(/"/g, "");
    }
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);

    return error ? error.details[0].message.replace(/"/g, "") : null;
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, errors });
  };

  handleSubmit = e => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  renderButton(label, other = {}) {
    const autoFocus = other.autoFocus;
    const validate = this.validate();
    return (
      <button autoFocus={autoFocus} disabled={this.validate()} className="btn btn-primary">
        {label}
      </button>
    );
  }

  renderInput(name, label, other = {}) {
    const type = other.type || 'text';
    const autoFocus = other.autoFocus;
    const placeholder = other.placeholder;
    const showError = other.showError;
    const autoComplete = other.autoComplete || 'off';
    const step = other.step || '1';
    const className = other.className;
    const button = other.button;
    const groupClassName = other.groupClassName;
    const { data, errors } = this.state;
    return (
      <Input
        autoFocus={autoFocus}
        name={name}
        value={data[name]}
        label={label}
        autoComplete={autoComplete}
        onChange={this.handleChange}
        error={errors[name]}
        type={type}
        step={step}
        button={button}
        placeholder={placeholder}
        showError={showError}
        className={className}
        groupClassName={groupClassName}
      />
    );
  }
}

export default Form;
