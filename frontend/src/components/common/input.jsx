import React from "react";

const Input = ({ button, groupClassName, className, showError, name, label, error, ...other }) => {
  return (
    <div className={`form-group ${groupClassName}`}>
      { label && <label htmlFor={name}>{label}</label> }
      <input
        id={name}
        name={name}
        {...other}
        className={`form-control ${className}`}
      />
      {button}
      {showError !== false && error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
