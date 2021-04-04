<template>
  <h1>Camera</h1>
  <video
    ref="videoEl"
    autoplay
    muted
  />
</template>

<script>
import { io } from 'socket.io-client'
import { ref } from '@vue/reactivity'
export default {
  name: 'Camera',
  setup () {
    const videoEl = ref(null)
    const DOMAIN = process.env.NODE_ENV === 'development' ? 'https://signal-server-6zwa3npg7q-de.a.run.app' : 'https://signal-server-6zwa3npg7q-de.a.run.app'
    const socket = io(DOMAIN)
    let pc

    socket.on('connect', async () => {
      pc = createPeerConnection()
      pc.onicecandidate = handleIceCandidate
      await setLocalStreamAndAddTrack()
      await setLocalSDP()

      function createPeerConnection () {
        return new RTCPeerConnection({
          iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
          }]
        })
      }

      async function setLocalStreamAndAddTrack () {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: ['environment', 'user'],
            width: 1280,
            height: 720
          },
          audio: true
        })
        videoEl.value.srcObject = stream
        const track = stream.getTracks()[1]
        pc.addTrack(track, stream)
      }

      async function setLocalSDP () {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('sendOffer', offer)
      }

      function handleIceCandidate ({ candidate }) {
        if (candidate) {
          socket.emit('sendCandidate', candidate)
        }
      }
    })

    socket.on('answer', async (answer) => {
      if (answer) {
        await pc.setRemoteDescription(answer)
      }
    })

    socket.on('candidate', candidate => {
      pc.addIceCandidate(candidate)
    })

    return {
      videoEl
    }
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
