import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Camera from '@/views/Camera.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/camera',
    name: 'About',
    component: Camera
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
