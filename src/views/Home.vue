<template>
  <h1>Client</h1>
  <div class="video-wrapper">
    <video
      id="remote"
      autoplay
    />
    <video
      id="local"
      autoplay
      muted
    />
  </div>
</template>

<script>
import { io } from 'socket.io-client'
export default {
  name: 'Home',
  setup () {
    const DOMAIN = 'https://signal-server-6zwa3npg7q-de.a.run.app'
    const socket = io(DOMAIN)
    let pc

    socket.on('connect', async () => {
      const { stream, track } = await setLocalStream()
      pc = createPeerConnection()
      track.forEach(track => pc.addTrack(track, stream))
      pc.onicecandidate = handleIceCandidate
      pc.addEventListener('track', event => {
        const videoEl = document.querySelector('#remote')
        videoEl.srcObject = event.streams[0]
      })

      async function setLocalStream () {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: ['environment', 'user'],
            width: 640,
            height: 720
          },
          audio: true
        })
        document.querySelector('#local').srcObject = stream

        return {
          stream,
          track: stream.getTracks()
        }
      }

      function createPeerConnection () {
        return new RTCPeerConnection({
          iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
          }]
        })
      }

      function handleIceCandidate ({ candidate }) {
        if (candidate) {
          socket.emit('sendCandidate', candidate)
        }
      }
    })

    socket.on('offer', async (offer) => {
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('sendAnswer', answer)
    })

    socket.on('candidate', candidate => {
      pc.addIceCandidate(candidate)
    })
  }
}
</script>

<style lang="scss" scoped>
.video-wrapper{
  width:100%;
  display:flex;
  justify-content: center;
}
</style>
