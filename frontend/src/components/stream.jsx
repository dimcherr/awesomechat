import React, { Component } from "react";

class Stream extends Component {
  constructor(props) {
    super(props);
    this.video = React.createRef();
  }

  componentDidMount() {
    this.setMediaStream(this.props.source);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.source) {
      this.setMediaStream(null);
      return;
    }
    if (
      !prevProps ||
      !prevProps.source ||
      prevProps.source.id !== this.props.source.id
    ) {
      this.setMediaStream(this.props.source);
    }
  }

  setMediaStream(source) {
    if (this.video && this.video.current) {
      this.video.current.srcObject = source;
    }
  }

  render() {
    return (
      <div className="video-container">
        <video
          className="video"
          ref={this.video}
          autoPlay
          muted={this.props.muted}
        />
      </div>
    );
  }
}

export default Stream;
