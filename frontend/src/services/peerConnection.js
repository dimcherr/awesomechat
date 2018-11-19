import { ICE_URL } from "../config";
const PEER_CONNECTION_CONFIG = { iceServers: [{ urls: [ICE_URL] }] };

class PeerConnection {
  pc = null;
  remoteId = null;

  onStopListener = null;
  onCallListener = null;
  onPeerStreamListener = null;

  roomId = null;
  user = null;

  constructor(remoteId, roomId, user) {
    this.pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    this.pc.onicecandidate = event => {
      if (this.onCallListener)
        this.onCallListener({
          to: this.remoteId,
          candidate: event.candidate,
          roomId,
          user
        });
    };
    this.pc.onaddstream = event => {
      if (this.onPeerStreamListener) this.onPeerStreamListener({source: event.stream, remoteId: this.remoteId});
    };

    this.remoteId = remoteId;
    this.roomId = roomId;
    this.user = user;
  }

  clearListeners() {
    this.onPeerStreamListener = null;
    this.onStopListener = null;
    this.onCallListener = null;

    return this;
  }

  setOnPeerStreamListener(listener) {
    this.onPeerStreamListener = listener;
    return this;
  }

  setOnStopListener(listener) {
    this.onStopListener = listener;
    return this;
  }

  setOnCallListener(listener) {
    this.onCallListener = listener;
    return this;
  }

  stop() {
    if (this.onStopListener) this.onStopListener();
    this.pc.close();
    this.pc = null;
    this.clearListeners();
    return this;
  }

  addStream(stream) {
    this.pc.addStream(stream);
  }

  createOffer() {
    this.pc
      .createOffer()
      .then(this.getDescription.bind(this))
      .catch(err => {}); // TODO will fix it later.
    return this;
  }

  createAnswer() {
    return this.pc
      .createAnswer()
      .then(this.getDescription.bind(this))
      .catch(err => {}); // TODO will fix it later.
  }

  getDescription(desc) {
    if (this.onCallListener)
      this.onCallListener({
        to: this.remoteId,
        sdp: desc,
        roomId: this.roomId,
        user: this.user
      });

    return this.pc.setLocalDescription(desc);
  }

  setRemoteDescription(sdp) {
      const rtcSdp = new RTCSessionDescription(sdp);
      return this.pc.setRemoteDescription(rtcSdp);
  }

  addIceCandidate(candidate) {
    if (candidate) {
      const iceCandidate = new RTCIceCandidate(candidate);
      this.pc.addIceCandidate(iceCandidate).catch(err => () => {}); // TODO fix it later
    }
    return this;
  }
}

export default PeerConnection;
