import React, { Component } from "react";
import MediaDevice from "../services/mediaDevice";
import Stream from "./stream";
import PeerConnection from "../services/peerConnection";
import _ from "lodash";
import {
  emitCall,
  emitCallRequest,
  emitEndCall,
  setOnBroadcastNewCallListener,
  setOnBroadcastCallListener,
  setOnBroadcastEndCallListener,
  setOnBroadcastJoinRoomListener
} from "../services/socketManager";

class StreamGroup extends Component {
  state = {
    localSource: null,
    peerConnections: {},
    isCalling: false,
    isAudioEnabled: true,
    isVideoEnabled: true
  };

  mediaDevice = null;

  createPeerConnection(remoteId) {
    return new PeerConnection(remoteId, this.props.room.id, this.props.user)
      .setOnCallListener(emitCall)
      .setOnStopListener(null)
      .setOnPeerStreamListener(({ source, remoteId }) => {
        this.addPeerStream(source, remoteId);
      });
  }

  addPeerStream(source, remoteId) {
    const { peerConnections } = this.state;
    const updatingConnection = peerConnections[remoteId];
    updatingConnection.source = source;
    this.setState({ peerConnections });
  }

  addPeerConnection(remoteId, isCaller) {
    const peerConnections = { ...this.state.peerConnections };
    const pc = this.createPeerConnection(remoteId);
    this.addLocalSourceToPeer(pc, isCaller);
    peerConnections[remoteId] = pc;
    this.setState({ peerConnections });
  }

  addLocalSourceToPeer(targetPC, isCaller) {
    const { localSource } = this.state;
    if (localSource) targetPC.addStream(localSource);
    if (isCaller) targetPC.createOffer();
  }

  componentDidMount() {
    setOnBroadcastJoinRoomListener(data => {
      if (data.user.id !== this.props.user.id && this.state.localSource) {
        emitCallRequest(data.room.id, this.props.user, true);
      }
      this.props.onBroadcastJoinRoom(data);
    });

    setOnBroadcastEndCallListener(({ userId }) => {
      const peerConnections = { ...this.state.peerConnections };
      const closingConnection = { ...peerConnections[userId] };
      if (closingConnection.source) {
        delete peerConnections[userId];
        closingConnection.source = null;
        peerConnections[userId] = closingConnection;
        this.setState({ peerConnections });
      }
    });

    setOnBroadcastNewCallListener(data => {
      if (data.user.id === this.props.user.id) {
        for (let user of data.allUsers.filter(u => u.id !== data.user.id)) {
            this.addPeerConnection(user.id, true);
        }
      } else {
        this.addPeerConnection(data.user.id, false);
      }
    });

    setOnBroadcastCallListener(data => {
      if (
        data.user.id === this.props.user.id ||
        !data.from ||
        data.to !== this.props.user.id
      ) {
        return;
      }

      const pc = this.state.peerConnections[data.from];
      if (data.sdp) {
        pc.setRemoteDescription(data.sdp).then(() => {
          if (data.sdp.type === "offer") pc.createAnswer();
        })
      }
      if (data.candidate) pc.addIceCandidate(data.candidate);
    });

    this.mediaDevice = new MediaDevice();
  }

  startCall = () => {
    if (this.mediaDevice) {
      this.mediaDevice.setOnStreamListener(source => {
        const { room, user } = this.props;
        emitCallRequest(room.id, user, false);
        this.setState({ localSource: source, isCalling: true });
      });
      this.mediaDevice.start();
    }
  };

  stopCall = () => {
    if (this.mediaDevice) {
      this.mediaDevice.stop();
      emitEndCall(this.props.room.id, this.props.user.id);
      this.setState({ isCalling: false, localSource: null });
    }
  };

  toggleVideo = () => {
    if (this.mediaDevice) {
      const { isVideoEnabled } = this.state;
      this.mediaDevice.toggle("video", !isVideoEnabled);
      this.setState({ isVideoEnabled: !isVideoEnabled });
    }
  };

  toggleAudio = () => {
    if (this.mediaDevice) {
      const { isAudioEnabled } = this.state;
      this.mediaDevice.toggle("audio", !isAudioEnabled);
      this.setState({ isAudioEnabled: !isAudioEnabled });
    }
  };

  renderRemotes = () => {
    const { peerConnections } = this.state;
    const remoteStreamList = Object.values(peerConnections)
      .filter(pc => pc.source && pc.source.id)
      .map(pc => (
        <Stream
          key={pc.remoteId}
          user={pc.user}
          source={pc.source}
          muted={false}
        />
      ));

    return remoteStreamList;
  };

  getControlButtons = () => {
    const { isCalling, isAudioEnabled, isVideoEnabled } = this.state;

    if (isCalling) {
      return [
        {
          key: 'stopcall',
          onClick: this.stopCall,
          icon: "call_end",
          className: "btn-danger"
        },
        {
          key: 'togglevideo',
          onClick: this.toggleVideo,
          icon: isVideoEnabled ? "videocam" : "videocam_off",
          className: "btn-dark"
        },
        {
          key: 'toggleaudio',
          onClick: this.toggleAudio,
          icon: isAudioEnabled ? "volume_up" : "volume_off",
          className: "btn-dark"
        }
      ];
    } else
      return [
        {
          key: 'startcall',
          onClick: this.startCall,
          icon: "call",
          className: "btn-success"
        }
      ];
  };

  render() {
    const { localSource } = this.state;
    return (
      <div className="stream-group">
        <Stream user={this.props.user} source={localSource} muted={true} />
        <div className="call-grid">{this.renderRemotes()}</div>
        <div className="btn-group" role="group" aria-label="First group">
          {this.getControlButtons().map(b => <button key={b.key} onClick={b.onClick} type="button" className={`control-button btn ${b.className}`}><i className="material-icons">{b.icon}</i></button>)}
        </div>
      </div>
    );
  }
}

export default StreamGroup;
