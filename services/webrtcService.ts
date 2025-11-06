import { socketService, WebRTCSignal } from './socketService';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private partnerId: string | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: RTCPeerConnectionState) => void) | null = null;

  async initialize(localStream: MediaStream, partnerId: string): Promise<void> {
    this.localStream = localStream;
    this.partnerId = partnerId;
    this.remoteStream = new MediaStream();

    this.peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
      if (this.onRemoteStreamCallback && this.remoteStream) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.partnerId) {
        socketService.sendWebRTCSignal({
          type: 'ice-candidate',
          data: event.candidate,
          from: 'me',
          to: this.partnerId,
        });
      }
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
      }
    };

    // Setup socket listeners for WebRTC signals
    socketService.onWebRTCSignal(this.handleWebRTCSignal.bind(this));
  }

  async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.partnerId) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.peerConnection.setLocalDescription(offer);

    socketService.sendWebRTCSignal({
      type: 'offer',
      data: offer,
      from: 'me',
      to: this.partnerId,
    });
  }

  private async handleWebRTCSignal(signal: WebRTCSignal): Promise<void> {
    if (!this.peerConnection) return;

    try {
      switch (signal.type) {
        case 'offer':
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.data)
          );
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          
          socketService.sendWebRTCSignal({
            type: 'answer',
            data: answer,
            from: 'me',
            to: signal.from,
          });
          break;

        case 'answer':
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.data)
          );
          break;

        case 'ice-candidate':
          await this.peerConnection.addIceCandidate(
            new RTCIceCandidate(signal.data)
          );
          break;
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error);
    }
  }

  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  close(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.partnerId = null;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
