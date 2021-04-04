<template>
  <h1>Client</h1>
  <video
    id="video"
    ref="videoEl"
    autoplay
    muted
  />
</template>

<script>
import { io } from 'socket.io-client'
export default {
  name: 'Home',
  setup () {
    const DOMAIN = process.env.NODE_ENV === 'development' ? 'https://signal-server-6zwa3npg7q-de.a.run.app' : 'https://signal-server-6zwa3npg7q-de.a.run.app'
    const socket = io(DOMAIN)
    let pc

    socket.on('connect', async () => {
      pc = createPeerConnection()
      pc.onicecandidate = handleIceCandidate
      pc.addEventListener('track', event => {
        const videoEl = document.getElementById('video')
        videoEl.srcObject = event.streams[0]
      })

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
      console.log(candidate)
      pc.addIceCandidate(candidate)
    })
  }
}
</script>

<style lang="scss" scoped>
video {
  display:block;
  width: calc(100% - 20px);
  max-width: 700px;
  margin: 5px auto;
}
</style>
