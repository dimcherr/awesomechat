import _ from "lodash";
import { toast } from "react-toastify";

class MediaDevice {
  stream = null;
  onStreamListener = null;

  setOnStreamListener(listener) {
    this.onStreamListener = listener;
    return this;
  }

  clearListeners() {
    this.onStreamListener = null;
    return this;
  }

  handleDeviceError = err => {
    if (err.name === "NotAllowedError")
      toast.error(
        `You have to grant permission for using device to make calls`
      );
    else if (err.name === "NotSupportedError")
      toast.error(
        `Your browser does not support video/audio calls. Please, update your browser`
      );
    else if (err.name == "NotFoundError") {
      toast.error(
        `Device is not found. Make sure you connected your device`
      );
    } else {
      toast.error(`There is some unexpected problem with your device`);
    }
  };

  start() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const cams = devices.filter(device => device.kind === 'videoinput')
      const mics = devices.filter(device => device.kind === 'audioinput')
      const constraints = { video: cams.length > 0 ? { facingMode: 'user', height: { max: 720 } } : false, audio: mics.length > 0 };
      return navigator.mediaDevices.getUserMedia(constraints);
    }).then(stream => {
      this.stream = stream;
      this.onStreamListener(stream);
    })
    .catch(this.handleDeviceError);

    return this;
  }

  toggle(type, isDeviceEnabled) {
    if (this.stream) {
      this.stream[`get${_.capitalize(type)}Tracks`]().forEach(track => {
        const newIsDeviceEnabled =
          arguments.length === 2 ? isDeviceEnabled : !track.enabled;
        _.set(track, "enabled", newIsDeviceEnabled);
      });
    }
    return this;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    return this;
  }
}

export default MediaDevice;
