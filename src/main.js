import 'core-js/stable'
import 'regenerator-runtime/runtime'
import browserDetect from 'vue-browser-detect-plugin'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import About from './components/About.vue'
import ComingSoonPlaceHolder from './components/ComingSoonPlaceHolder.vue'
import uswds from 'uswds'
import VueAnalytics from 'vue-analytics'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faWater } from '@fortawesome/free-solid-svg-icons'

// social icons
import { faTwitterSquare } from '@fortawesome/free-brands-svg-icons'
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faFlickr } from '@fortawesome/free-brands-svg-icons'
import { faYoutubeSquare } from '@fortawesome/free-brands-svg-icons'
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

Vue.component('font-awesome-icon', FontAwesomeIcon)

library.add(faInfo)
library.add(faLayerGroup)
library.add(faTimes)
library.add(faThumbsUp)
library.add(faThumbsDown)
library.add(faMinus)
library.add(faPlus)
library.add(faWater)

// social icons
library.add(faTwitterSquare)
library.add(faFacebookSquare)
library.add(faGithub)
library.add(faFlickr)
library.add(faYoutubeSquare)
library.add(faInstagram)

Vue.config.productionTip = false
Vue.use(uswds)
Vue.use(browserDetect)
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'ComingSoonPlaceHolder',
      component: ComingSoonPlaceHolder
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ],
  mode: 'history'
})

Vue.use(VueAnalytics, {
  id: 'UA-149352326-1',
  router
})

const app = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
