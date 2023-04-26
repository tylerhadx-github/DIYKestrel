import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
// import Map from '../components/Map.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld
  },
  // {
  //   path: '/Map',
  //   name: 'Map',
  //   component: Map
  // },
  // {
  //   path: '/chat/:sharedKey',
  //   name: 'chat',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../components/Chat.vue'),
  //   props: true,
  // }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
