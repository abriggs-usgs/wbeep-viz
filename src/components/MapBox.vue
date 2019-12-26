<template>
  <div
    id="viz_container"
    @click.once="clickAnywhereToCloseMapInfoBox"
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
      <div id="map-section">
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
          <MapLayers />
        </MglMap>
      </div>
      <div id="story-section">
        <StoryBoard :map="map" />
      </div>
    </div>
    <!--The next div contains information to show the current zoom level of the map. This will only show on the
          development version of the application. To find the code controlling this, search for 'zoom level display' -->
    <div id="zoom-level-div" />
  </div>
</template>
<script>
    import LoadingScreen from './LoadingScreen';
    import InternetExplorerPage from "./InternetExplorerPage";
    import MapSubtitle from "./MapSubtitle";
    import MapLegend from "./MapLegend";
    import MapLayers from "./MapLayers";
    import { icon } from "@fortawesome/fontawesome-svg-core";
    import QuestionControl from "./QuestionControl";
    import StoryBoard from "./StoryBoard";

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
            MapLayers,
            QuestionControl,
            StoryBoard
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
                zoom: 3,
                minZoom: 2,
                maxZoom: 15,
                center: [-95.7129, 37.0902],
                pitch: 0, // tips the map from 0 to 60 degrees
                bearing: 0, // starting rotation of the map from 0 to 360
                hoveredHRUId: null,
                maxBounds: [[-179.56055624999985, 9.838930211369288], [-11.865243750001127, 57.20768307316615]], // The coordinates needed to make a bounding box for the continental United States.
                legendTitle: "Latest Natural Water Storage",
                isLoading: true,
                isAboutMapInfoBoxOpen: true,
                isFirstClick: true,
                map: null
            };
        },
        methods: {
            runGoogleAnalytics(eventName, action, label) {
                this.$ga.set({ dimension2: Date.now() });
                this.$ga.event(eventName, action, label);
            },
            clickAnywhereToCloseMapInfoBox() {
                this.isAboutMapInfoBoxOpen = !this.isAboutMapInfoBoxOpen;
                this.isFirstClick = false;
            },
            toggleMapInfoBox() {
                if (!this.isFirstClick) {
                    this.isAboutMapInfoBoxOpen = !this.isAboutMapInfoBoxOpen;
                }
            },
            onMapLoaded(event) {
                this.map = event.map; // This gives us access to the map as an object but only after the map has loaded.
let map = this.map;
                // We need to get the global Google Analytics (GA) plugin object 'this.$ga' into this scope, so let's make
                // a local variable and assign our GA event tracking method to that.
                let googleAnalytics = this.runGoogleAnalytics;

                //This solves the mysterious whitespace by resizing the map to the correct size.
                map.resize();

                // pinch to zoom for touch devices
                map.touchZoomRotate.enable();
                // disable the rotation functionality, but keep pinch to zoom
                map.touchZoomRotate.disableRotation();

                // Once map is loaded, zoom in a bit more so that the map neatly fills the screen.
                map.fitBounds([[-125.3321, 23.8991], [-65.7421, 49.4325]]);
                //set timeout to make sure the fitbounds is completely done before fadeaway
                setTimeout(() => {
                    this.isLoading = false;
                }, 200);


                //Create elements and give them specific ids
                //Div that the map uses to display things fullscreen
                let correctDiv = document.getElementById("map");
                let mapLayersToggleContainer = document.createElement("div");
                let toggleOptions = document.createElement("div");
                let toggleTitleContainer = document.createElement("div");
                let toggleTitle = document.createElement("div");
                let toggleExit = document.createElement("div");
                let exitIcon = document.createElement("span");
                exitIcon.innerHTML = icon({ prefix: "fas", iconName: "times" }).html;
                let mapLayers = document.createElement("div");
                let flowDetail = document.createElement("div");
                let streams = document.createElement("div");
                //Add ids and classes
                mapLayersToggleContainer.id = "mapLayersToggleContainer";
                toggleTitleContainer.id = "toggleTitleContainer";
                toggleTitleContainer.className = "layersTitle";
                toggleTitle.id = "toggleTitle";
                toggleExit.id = "toggleExit";
                toggleOptions.id = "toggleOptions";
                mapLayers.id = "mapLayers";
                flowDetail.id = "flowDetail";
                flowDetail.className = "layersTitle";
                mapLayers.className = "options";
                streams.id = "streams";
                streams.className = "options";

                toggleTitle.innerHTML = "Map Options";
                flowDetail.innerHTML = "Flow Detail";
                mapLayersToggleContainer.style.display = "none";

                //Append elements
                toggleExit.appendChild(exitIcon);
                toggleTitleContainer.appendChild(toggleTitle);
                toggleTitleContainer.appendChild(toggleExit);
                toggleOptions.appendChild(mapLayers);
                toggleOptions.appendChild(flowDetail);
                toggleOptions.appendChild(streams);
                mapLayersToggleContainer.appendChild(toggleTitleContainer);
                mapLayersToggleContainer.appendChild(toggleOptions);
                correctDiv.appendChild(mapLayersToggleContainer);

                mapLayersToggleContainer.onclick = function(e){
                    e.stopPropagation();
                }
                toggleExit.onclick = function(e){
                    e.stopPropagation();
                    contentToggle(mapLayersToggleContainer);
                }
                document.body.onclick = function(){
                    if(mapLayersToggleContainer.style.display === "block"){
                        contentToggle(mapLayersToggleContainer);
                    }
                }
                let contentToggle = function(name) {
                    if (name.style.display === "block") {
                        name.style.display = "none";
                    } else {
                        name.style.display = "block";
                    }
                };

                // Next section gives us names for the layer toggle buttons
                let styleLayers = Object.values(mapStyles.style.layers); // Pulls the layers out of the styles object as an array

                let toggleableLayerIds = [];
                let layersTurnedOffAtStart = [];
                let toggleableStreamsIds = [];
                let streamsTurnedOffAtStart = [];

                let assembledIdSets = [];
                let assembledOffAtStartSets = [];

                for (let index = 0; index < styleLayers.length; index++) {
                    if (styleLayers[index].showButtonLayerToggle === true) {
                        // note: to NOT show a button for layer, change the 'showButtonLayerToggle' property in the mapStyles.js to false
                        toggleableLayerIds.push(styleLayers[index].id);

                        // Make a list if ids of any layers that we do not want to show when the page loads (layers that are toggleable but are off by default)
                        // These layers that are off by default have a visibility of 'none' in the style sheet.
                        if (styleLayers[index].layout.visibility === "none") {
                            layersTurnedOffAtStart.push(styleLayers[index].id);
                        }
                    }
                    if (styleLayers[index].showButtonStreamToggle === true) {
                        toggleableStreamsIds.push(styleLayers[index].id);
                        if (styleLayers[index].layout.visibility === 'none') {
                            streamsTurnedOffAtStart.push(styleLayers[index].id);
                        }
                    }
                }
                assembledIdSets.push(toggleableLayerIds);
                assembledIdSets.push(toggleableStreamsIds);

                assembledOffAtStartSets.push(layersTurnedOffAtStart);
                assembledOffAtStartSets.push(streamsTurnedOffAtStart);


                let elementTargets = ["mapLayers", "streams"];
                let countup = 0;

                assembledIdSets.forEach(function(idSet) {
                    // Go through each layer id that is in the array and make a button element for it
                    for (let index = 0; index < idSet.length; index++) {
                        let id = idSet[index];
                        let link = document.createElement("a");
                        link.href = "#";
                        // If the layer is not set to visible when first loaded, then do not mark it as active.
                        // In other words, if the layer is not visible on page load, make the button look like the layer is toggled off
                        if (assembledOffAtStartSets[countup].includes(id)) {
                            link.className = "";
                        } else {
                            link.className = "active";
                        }
                        // Set the wording (label) for the layer toggle button to match the 'id' listed in the style sheet
                        link.textContent = id;
                        // Creates a click event for each button so that when clicked by the user, the visibility property
                        // is changed as is the class (color) of the button
                        link.onclick = function(e) {
                            googleAnalytics('layers-menu', 'click', 'user clicked ' + id);
                            let clickedLayer = this.textContent;
                            let clickedLayerParent = this.parentElement;
                            let clickedLayerParentKids = clickedLayerParent.children;
                            e.preventDefault();
                            e.stopPropagation();
                            let visibility = map.getLayoutProperty(
                                    clickedLayer,
                                    "visibility"
                            );
                            if (visibility === "visible") {
                                map.setLayoutProperty(clickedLayer, "visibility", "none");
                                this.className = "";
                            } else {
                                if(clickedLayerParent.id === "streams"){
                                    for(let i = 0; i < clickedLayerParentKids.length; i++){
                                        clickedLayerParentKids[i].className = "";
                                        map.setLayoutProperty(clickedLayerParentKids[i].textContent, "visibility", "none");
                                    }
                                }
                                this.className = "active";
                                map.setLayoutProperty(clickedLayer, "visibility", "visible");
                            }
                        };
                        let layerToggleList = document.getElementById(elementTargets[countup]);
                        layerToggleList.appendChild(link);
                    }
                    countup++;
                });

                // next section controls the HRU hover effect
                let hoveredHRUId = this.hoveredHRUId;

                map.on("mousemove", "HRUs", function(e) {
                    if (e.features.length > 0) {
                        if (hoveredHRUId) {
                            map.setFeatureState(
                                    { source: "HRU", sourceLayer: "hrus", id: hoveredHRUId },
                                    { hover: false }
                            );
                        }
                        hoveredHRUId = e.features[0].id;
                        map.setFeatureState(
                                { source: "HRU", sourceLayer: "hrus", id: hoveredHRUId },
                                { hover: true }
                        );
                    }
                });
                map.on("mouseleave", "HRUS Fill Colors", function() {
                    if (hoveredHRUId) {
                        map.setFeatureState(
                                { source: "HRU", sourceLayer: "hrus", id: hoveredHRUId },
                                { hover: false }
                        );
                    }
                    hoveredHRUId = null;
                });
                
                // Next section adds the current zoom level display to the map for development purposes.
                // The zoom level display should only show in 'development' versions of the application
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

  .header-container {
    background-color: #fff;
  }
  /* Add a background color to the layer toggle bar */
  #mapbox_component-layer-toggle {
    background-color: $blue;
    overflow: hidden;
    display: flex;
  }

  #topNavText {
    border-right: $border;
    width: 110px;
    a {
      width: 100%;
      font-size: 0.9em;
      color: $color;
      background: #00264c;
      vertical-align: center;
    }
  }

  #iconToggleContainer {
    display: flex;
    width: 120px;
    border-left: $border;
    a {
      flex: 1;
      background: #00264c;
      margin: 0;
      color: $color;
    }

    a.active{
      background: #00bf26
    }

    .icon {
      &:nth-child(2){
        border-left: $border;
      }
    }
  }

  #layers,
  #streams{
    display: none;
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

  #aboutButton{
    background: none;
    color: #003366;
    width: 100px;
    height: 100%;
    margin: 0;
    outline: none;
    border-style: none;
    &:hover{
      background: #00bf26;
      color: #fff;
    }
  }

  #mapContainer {
    position: relative;
    min-height: 200px;
    max-height: 1080px;
    display: flex;

    #map-section {
      flex: 3;
    }

    #story-section {
      flex: 1;
      overflow-y: auto;
    }
}
</style>
<style lang="scss">
  $color: #fff;
  $blue: #4574a3;
  $border: 1px solid rgb(200, 200, 200);
  $background: rgba(255, 255, 255, 0.9);

  #mapLayersToggleContainer {
    background: $background;
    border-right: $border;
    width: 90%;
    height: 100%;
    position: absolute;
    z-index: 9000;

    a{
      outline: none;
    }
  }

  #toggleTitleContainer {
    display: flex;
    border-bottom: $border;
  }

  .layersTitle{
    height: 35px;
    padding: 0 0 0 10px;
    line-height: 35px;
    font-size: 1.4em;
    background: #003366;
    color: #fff;
  }

  #toggleTitle {
    flex: 1;
  }

  #toggleExit {
    width: 35px;
    height: 35px;
    text-align: center;
    border-left: $border;
    cursor: pointer;

    &:hover{
      background: #00bf26;
      color: #fff;
    }

    svg {
      width: 20px;
      height: 20px;
      margin: 6px 0 0 0;
    }
  }

  #toggleOptions {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .options {
    display: flex;
    flex-direction: column;
    a {
      padding: 10px;
      border-bottom: $border;
      text-decoration: none;
      font-size: 1em;
      color: #000;
      background: #f5f7fb;
      &:hover {
        background: #00bf26;
        color: #fff;
        opacity: 1;
      }
    }
    .active {
      background: #003366;
      opacity: .7;
      color: #fff;
    }
  }

  .usa-banner__inner {
    margin-left: 10px;
    padding-left: 5px;
  }

  @media screen and (min-width: 960px){
    #mapLayersToggleContainer{
      width: 25%;
      max-width: 500px;
      height: auto;
      max-height: 100%;
      overflow-y: auto;
    }
  }
</style>
