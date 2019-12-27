<template>
  <div
    id="viz_container"
  >
    <LoadingScreen
      v-if="!isInternetExplorer"
      :is-loading="isLoading"
    />

    <div class="header-container">
      <div class="usa-prose">
        <h1 class="title-text">
          {{ title }}{{ titleSuffix }} {{ developmentTier }}
        </h1>
      </div>
    </div>
    <InternetExplorerPage v-if="isInternetExplorer" />
    <div
      v-if="!isInternetExplorer"
      id="mapContainer"
    >
      <MglMap
        id="mapgl"
        :container="container"
        :map-style="mapStyle"
        :zoom="zoom"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :center="center"
        :pitch="pitch"
        :bearing="bearing"
        :pitch-with-rotate="false"
        :drag-rotate="false"
        :touch-zoom-rotate="false"
        :max-bounds="maxBounds"
        @load="onMapLoaded"
      >
        <MglAttributionControl
          position="bottom-right"
          :compact="false"
          custom-attribution="© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        <MglNavigationControl
          position="top-right"
          :show-compass="false"
        />
        <QuestionControl />
        <MglScaleControl
          position="bottom-right"
          unit="imperial"
        />
        <MglFullscreenControl position="bottom-right" />
        <MglGeolocateControl position="bottom-right" />
      </MglMap>
    </div>
    <!--The next div contains information to show the current zoom level of the map. This will only show on the
          development version of the application. To find the code controlling this, search for 'zoom level display' -->
    <div id="zoom-level-div" />
  </div>
</template>
<script>
    import LoadingScreen from './LoadingScreen';
    import InternetExplorerPage from "./InternetExplorerPage";
    import QuestionControl from "./QuestionControl";

    import {
        MglMap,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl,
        MglAttributionControl
    } from "vue-mapbox";
    import mapStyles from "../assets/mapStyles/mapStyles";

    export default {
        name: "MapBox",
        components: {
            LoadingScreen,
            InternetExplorerPage,
            MglMap,
            MglNavigationControl,
            MglGeolocateControl,
            MglFullscreenControl,
            MglScaleControl,
            MglAttributionControl,
            QuestionControl
        },
        props: {
            isInternetExplorer: {
                type: Boolean,
                required: true,
                default: false
            }
        },
        data() {
            return {
                title: process.env.VUE_APP_TITLE,
                titleSuffix: process.env.VUE_APP_TITLE_SUFFIX,
                developmentTier: process.env.VUE_APP_TIER,
                mapStyle: mapStyles.style,
                container: "map",
                zoom: 2,
                minZoom: 2,
                maxZoom: 5.99,
                center: [-95.7129, 37.0902],
                pitch: 0, // tips the map from 0 to 60 degrees
                bearing: 0, // starting rotation of the map from 0 to 360
                maxBounds: [[-168.534393,-4.371744], [-19.832382,71.687625]], // The coordinates needed to make a bounding box for the continental United States.
                isLoading: true

            };
        },
        created() {
           this.map = null;
        },
        methods: {
            onMapLoaded(event) {
                this.map = event.map; // This gives us access to the map as an object but only after the map has loaded.
                this.map.resize(); //This solves the mysterious whitespace that was appeared above the footer, but was caused by the 'official' banner at the top.
                this.map.touchZoomRotate.enable({ around: 'center' }); // pinch to zoom for touch devices
                this.map.touchZoomRotate.disableRotation(); // disable the rotation functionality, but keep pinch to zoom
                this.map.fitBounds([[-125.3321, 23.8991], [-65.7421, 49.4325]]); // Once map is loaded, zoom in a bit more so that the map neatly fills the screen.
                this.$store.map = event.map; // add the map to the Vuex store so that we can use it in other components

                //set timeout to make sure the fitbounds is completely done before fade away of loading screen
                setTimeout(() => {
                    this.isLoading = false;
                }, 200);

                // Next section adds the current zoom level display to the map for development purposes.
                // The zoom level display should only show in 'development' versions of the application
                let map = this.map;
                if (process.env.VUE_APP_ADD_ZOOM_LEVEL_DISPLAY && process.env.VUE_APP_ADD_ZOOM_LEVEL_DISPLAY === 'true') {
                    function onZoomend() {
                        let currentZoom = map.getZoom();
                        document.getElementById("zoom-level-div").innerHTML = 'Current Zoom Level (listed for development purposes): ' + currentZoom ;
                    }
                    map.on("zoomend", onZoomend);
                }
            }
        }
    };
</script>

<style scoped lang="scss">
  @import "~mapbox-gl/dist/mapbox-gl.css";
  $color: #fff;
  $blue: #4574a3;
  $border: 1px solid #fff;
  $borderGray: 1px solid rgb(100, 100, 100);

  #overlay {
    position: fixed; /* Sit on top of the page content */
    display: none; /* Hidden by default */
    width: 100%; /* Full width (cover the whole page) */
    height: 100%; /* Full height (cover the whole page) */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5); /* Black background with opacity */
    z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
    cursor: pointer; /* Add a pointer on hover */
  }

  .usa-prose {
    border-bottom: $borderGray;
    display: flex;
    h1 {
      font-size: 1rem;
      margin-left: 10px;
      flex: 1;
    }
    a{
      margin: 0;
      display: block;
    }
  }

  .title-text {
    margin-left: 1.5rem;
    padding: 0.25rem;
  }

  #mapContainer {
    position: relative;
    height: 80vh;
    min-height: 550px;
    display: flex;
    flex-direction: column;
  }

  @media screen and (min-width: 600px) and (min-height: 850px) {
    #viz_container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    #mapContainer {
      flex: 1;
      height: auto;
    }
  }
</style>


