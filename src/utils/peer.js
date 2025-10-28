import Peer from 'simple-peer';

// This is a placeholder for the peer-to-peer communication logic.
// A signaling server is required for WebRTC to work.

export const createPeer = (initiator, trickle, stream) => {
  const peer = new Peer({ initiator, trickle, stream });

  peer.on('error', (err) => console.error('peer error', err));

  peer.on('signal', (data) => {
    // This is where you would send the signal data to the other peer via a signaling server.
    console.log('SIGNAL', JSON.stringify(data));
  });

  peer.on('connect', () => {
    console.log('CONNECT');
    peer.send(`whatever ${Math.random()}`);
  });

  peer.on('data', (data) => {
    console.log(`data: ${data}`);
  });

  return peer;
};
