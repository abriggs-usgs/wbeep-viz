<template>
  <div id="app">
    <HeaderUSGS />
    <Visualization visualization_title="A Title Related to Water Availability"/>
    <FooterUSGS />
  </div>
</template>

<script>
import HeaderUSGS from './components/HeaderUSGS'
import Visualization from './components/Visualization.vue'
import FooterUSGS from './components/FooterUSGS'

export default {
  name: 'app',
  components: {
    HeaderUSGS,
    Visualization,
    FooterUSGS
  }
}
</script>

<style lang="scss">
body{
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
