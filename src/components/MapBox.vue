<template>
  <div id="viz_container">
    <div class="header-container">
      <div class="usa-prose">
        <h1 class="title-text">
          {{ title }} {{ developmentTier }}
        </h1>
      </div>
    </div>
    <div id="mapContainer">
      <MapSubtitle />
      <MapAvailableDataDate />
      <MapLegend :legend-title="legendTitle" />
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
        @load="onMapLoaded"
      >
        <MglAttributionControl
          position="bottom-right"
          :compact="false"
          custom-attribution="© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <MglScaleControl
          position="bottom-right"
          unit="imperial"
        />
        <MglNavigationControl
          position="top-left"
          :show-compass="false"
        />
        <MglGeolocateControl position="top-right" />
        <MglFullscreenControl position="top-right" />
        <MapLayers />
      </MglMap>
    </div>
    <!--The next div contains information to show the current zoom level of the map. This will only show on the
        development version of the application. To find the code controlling this, search for 'zoom level display' -->
    <div id="zoom-level-div" />
    <button id='fly'>Fly</button>
    <div id="coords"></div>
  </div>
</template>
<script>
import MapSubtitle from "./MapSubtitle";
import MapAvailableDataDate from "./MapAvailableDataDate";
import MapLegend from "./MapLegend";
import MapLayers from "./MapLayers";
import { icon } from "@fortawesome/fontawesome-svg-core";

import {
  MglMap,
  MglNavigationControl,
  MglGeolocateControl,
  MglFullscreenControl,
  MglScaleControl,
  MglAttributionControl
} from "vue-mapbox";
import mapStyles from "../assets/mapStyles/mapStyles";
import mariaTrackGeoJSON from "../assets/hurricaneTracks/2017_maria";
import michaelTrackGeoJSON from "../assets/hurricaneTracks/2018_michael";

export default {
  name: "MapBox",
  components: {
    MglMap,
    MapSubtitle,
    MapAvailableDataDate,
    MglNavigationControl,
    MglGeolocateControl,
    MglFullscreenControl,
    MglScaleControl,
    MglAttributionControl,
    MapLegend,
    MapLayers
  },
  props: {
    title: {
      type: String,
      default: process.env.VUE_APP_TITLE
    },
    developmentTier: {
        type: String,
        default: process.env.VUE_APP_TIER
    }
  },
  data() {
    return {
      mapStyle: mapStyles.style,
      container: "map",
      zoom: 7,
      minZoom: 2,
      maxZoom: 11,
      center: [-86.2, 24.6],
      pitch: 45, // tips the map from 0 to 60 degrees
      bearing: 0, // starting rotation of the map from 0 to 360
      hoveredHRUId: null,
      // maxBounds: [[-179.56055624999985, 9.838930211369288], [-11.865243750001127, 57.20768307316615]], // The coordinates needed to make a bounding box for the continental United States.
      legendTitle: "Latest Available Water Status"
    };
  },
  methods: {
    runGoogleAnalytics(eventName, action, label) {
        this.$ga.event(eventName, action, label)
    },
    onMapLoaded(event) {
      // We need to get the global Google Analytics (GA) plugin object 'this.$ga' into this scope, so let's make
      // a local variable and assign our GA event tracking method to that.
      let googleAnalytics = this.runGoogleAnalytics;

      let map = event.map; // This gives us access to the map as an object but only after the map has loaded

      // Once map is loaded, zoom in a bit more so that the map neatly fills the screen
      // map.fitBounds([[-125.3321, 23.8991], [-65.7421, 49.4325]]);

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
      exitIcon.onclick = function(e){
        e.stopPropagation();
        contentToggle(mapLayersToggleContainer);
      }
      document.body.onclick = function(){
        if(mapLayersToggleContainer.style.display === "block"){
          contentToggle(mapLayersToggleContainer);
        }
      }

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
      //Subtitle and legend information Modal functionality
      let infoButton = document.getElementById("subtitleInfoButton");
      let modal = document.getElementById("subtitleInfoModal");
      let legendInfoButton = document.getElementById("legendInfoButton");
      let legendModal = document.getElementById("legendModal");
      let legendExit = document.getElementById("legendExit");
      let legendCollapseButton = document.getElementById("legendMinus");
      let legendExpandButton = document.getElementById("legendPlus");
      let legend = document.getElementById("map_legend_container");
      let collapsedLegend = document.getElementById("collapsedLegend");

      //Info Button Click Function
      infoButton.onclick = function() {
        contentToggle(modal);
      };
      //Legend Modal functionality
      legendInfoButton.onclick = function() {
        contentToggle(legendModal);
      };
      legendExit.onclick = function() {
        contentToggle(legendModal);
      };

      legendCollapseButton.onclick = function(){
        legendToggle(collapsedLegend, legend)
      };

      legendExpandButton.onclick = function(){
        legendToggle(collapsedLegend, legend)
      };

      let contentToggle = function(name) {
        if (name.style.display === "block") {
          name.style.display = "none";
        } else {
          name.style.display = "block";
        }
      };

      //legendModalToggle function
      let legendToggle = function(name, flip) {
        if (name.style.display === "block") {
          name.style.display = "none";
          flip.style.display = "block";
        } else {
          name.style.display = "block";
          flip.style.display = "none";
        }
      };

      // Next section adds the current zoom level display to the map for development purposes.
      // The zoom level display should only show in 'development' versions of the application
      if (process.env.VUE_APP_ADD_ZOOM_LEVEL_DISPLAY && process.env.VUE_APP_ADD_ZOOM_LEVEL_DISPLAY === 'true') {
          function onZoomend() {
              let currentZoom = map.getZoom();
              document.getElementById("zoom-level-div").innerHTML = 'Current Zoom Level (listed for development purposes): ' + currentZoom ;
          }
          map.on("zoomend", onZoomend);
      }

        let hurricaneTrack = [];



        michaelTrackGeoJSON.michaelData.features.forEach(function(feature) {
            feature.geometry.coordinates.forEach(function (coordinateSet) {
                hurricaneTrack.push(coordinateSet)
            })
        });

        let addHurricanPathToMap = function(hurricaneTrackGeoJSON) {
            map.addSource("michaelTrackGeoJSON", {
                "type": "geojson",
                "data": hurricaneTrackGeoJSON
            });
        }

        addHurricanPathToMap(michaelTrackGeoJSON.michaelData);
        map.addLayer({
            'id': 'hurricane track',
            'type': 'line',
            'source': 'michaelTrackGeoJSON',
            'layout': {
                'visibility': 'visible',
            },
            'paint': {
                'line-color': 'red',
                'line-width': {
                    'base': 2.55,
                    'stops': [
                        [0, 4],
                        [20, 8]
                    ]
                }
            }
        });


        const degreesToRadians = function(degrees) {
            return degrees * Math.PI / 180;
        }

        const distanceInKmBetweenEarthCoordinates = function(lat1, lon1, lat2, lon2) {
            let earthRadiusKm = 6371;

            let dLat = degreesToRadians(lat2-lat1);
            let dLon = degreesToRadians(lon2-lon1);

            lat1 = degreesToRadians(lat1);
            lat2 = degreesToRadians(lat2);

            let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return earthRadiusKm * c;
        }


let coorDiv = document.getElementById("coords");
        document.getElementById('fly').addEventListener('click', function () {

            let i = 0;
            let mapDistance = null;
            let distanceAdjustmentMultiplyer = 1;
            let baseDurationOfFlyToAction = 1000;
            let intervalId = setInterval(function(){
                if(i === hurricaneTrack.length - 1){
                  clearInterval(intervalId);
                }
                coorDiv.innerHTML = 'the current coordinates ' + hurricaneTrack[i][0] + ', ' + hurricaneTrack[i][1]

                if (i < hurricaneTrack.length - 1) {
                    mapDistance = distanceInKmBetweenEarthCoordinates(hurricaneTrack[i][0], hurricaneTrack[i][1], hurricaneTrack[i+1][0], hurricaneTrack[i+1][1]);
                }

                if (mapDistance != 0) {
                    distanceAdjustmentMultiplyer = baseDurationOfFlyToAction/mapDistance;
                    console.log('this is the multiplier ', distanceAdjustmentMultiplyer)
                }

                coorDiv.innerHTML = 'the current coordinates are ' + hurricaneTrack[i][0] + ', ' + hurricaneTrack[i][1] + ', and the distance between is ' + mapDistance + ' kilometers.'


                map.flyTo({
                    center: [hurricaneTrack[i][0], hurricaneTrack[i][1]],
                    zoom: 7,
                    bearing: 0,
                    speed: 0.12, // make the flying slow
                    curve: 1, // change the speed at which it zooms out
                });
                i++;

                console.log('duration ' + baseDurationOfFlyToAction/distanceAdjustmentMultiplyer)
            // }, baseDurationOfFlyToAction * distanceAdjustmentMultiplyer);
            }, baseDurationOfFlyToAction);
        });
    }
  }
};
</script>

<style scoped lang="scss">
@import "~mapbox-gl/dist/mapbox-gl.css";
$color: #fff;
$blue: #4574a3;
$border: 1px solid #fff;
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
  border-bottom: 1px solid rgb(100, 100, 100);
  h1 {
    font-size: 1rem;
    margin-left: 10px;
  }
}

/* override USWDS style to prevent title from wrapping too soon */
.title-text {
  margin-left: 1.5rem;
  padding: 0.25rem;
}

#mapContainer {
  position: relative;
  height: 80vh;
}

@media screen and (min-width: 600px) {
  #viz_container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  #mapContainer {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: auto;
  }
  #map {
    flex: 1;
    min-height: 70vh;
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
