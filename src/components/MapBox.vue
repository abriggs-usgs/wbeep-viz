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
    <!--The next div contains information to show the current zoom level of the map. This will only show on the
          development version of the application. To find the code controlling this, search for 'zoom level display' -->
    <div id="zoom-level-div" />
  </div>
</template>
<script>
    import LoadingScreen from './LoadingScreen';
    import InternetExplorerPage from './InternetExplorerPage';
    import MapLayers from './MapLayers';
    import { icon } from '@fortawesome/fontawesome-svg-core';
    import QuestionControl from './QuestionControl';
    import waterAreaByState from "../assets/json/waterAreaByState";

    import {
        MglMap,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl,
        MglAttributionControl
    } from 'vue-mapbox';
    import mapStyles from '../assets/mapStyles/mapStyles';

    export default {
        name: 'MapBox',
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
                container: 'map',
                zoom: 2,
                minZoom: 0,
                maxZoom: 24,
                center: [-95.7129, 37.0902],
                pitch: 35, // tips the map from 0 to 60 degrees
                bearing: 0, // starting rotation of the map from 0 to 360

                maxBounds: [[-168.534393,-4.371744], [-19.832382,71.687625]], // The coordinates needed to make a bounding box for the continental United States.
                legendTitle: 'Latest Natural Water Storage',
                isLoading: true,
                isAboutMapInfoBoxOpen: true,
                isFirstClick: true,
                activeFlowDetailLayer: null,
                currentZoom: null,
                mapLayerIdsForZoomDependentButtons: ['Roads', 'Hydrologic Response Unit', 'Terrain', 'Counties', 'Least Detail', 'Medium Detail', 'Most Detail']
            };
        },
        methods: {

            addZoomLevelIndicator() {
                const map = this.$store.map;
                this.currentZoom = map.getZoom();
                process.env.VUE_APP_ADD_ZOOM_LEVEL_DISPLAY === 'true' ?
                        document.getElementById('zoom-level-div').innerHTML = 'Current Zoom Level (listed for development purposes): ' + this.currentZoom : null;
            },
            filterLayersForButtons: function(targetId) {
                const map = this.$store.map;

                let filteredMapLayer = map.getStyle().layers.filter(function(mapStyleLayer) {
                    return  mapStyleLayer.id === targetId;
                });

                return filteredMapLayer;
            },
            changeButtonStateBasedOnZoomLevel() {
                const map = this.$store.map;
                const self = this;
                this.mapLayerIdsForZoomDependentButtons.forEach(function(buttonId) {
                    let layerToChange = self.filterLayersForButtons(buttonId);
                    buttonId = buttonId.replace(/\s/g, ''); // Note: Element IDs cannot have white space so we know that we shouldn't look for any with white space
                    const targetElement = document.getElementById(`${buttonId}-button`);

                    if (layerToChange[0].minzoom > self.currentZoom) {
                        targetElement.className = 'unavailable';
                        targetElement.disabled = true;
                    } else if (targetElement.className === 'unavailable') {
                            targetElement.className = '';
                            targetElement.disabled = false;
                    }
                });
            },
            clickAnywhereToCloseMapInfoBox() {
                this.isAboutMapInfoBoxOpen = !this.isAboutMapInfoBoxOpen;
                this.isFirstClick = false;
            },
            contentToggle(elementToToggle) {
                elementToToggle.style.display === 'block' ? elementToToggle.style.display = 'none' : elementToToggle.style.display = 'block';
            },
            createLayerButtons(elementIds, idsOfButtonsOffWhenPageFirstLoads, elementTarget, googleAnalytics) {
                const map = this.$store.map;

                elementIds.forEach(function(elementId) {
                    let mapLayerButton = document.createElement('a');
                    mapLayerButton.href = '#';
                    mapLayerButton.id = `${elementId.replace(/\s/g, '')}-button`; // Note, Element IDs cannot have white space, so let's remove (replace) any that is there
                    // If the layer is not set to visible when first loaded, then do not mark it as active.
                    // In other words, if the layer is not visible on page load, make the button look like the layer is toggled off
                    idsOfButtonsOffWhenPageFirstLoads.includes(elementId) ? mapLayerButton.className = '' : mapLayerButton.className = 'active';
                    mapLayerButton.textContent = elementId; // Set the wording (label) for the layer toggle button to match the 'elementId' listed in the style sheet
                    mapLayerButton.onclick = function(e) {  // Creates a click event for each button so that when clicked by the user, the visibility property is changed as is the class (color) of the button
                        googleAnalytics('layers-menu', 'click', 'user clicked ' + elementId);
                        let clickedLayer = this.textContent;
                        let clickedLayerParent = this.parentElement;
                        let clickedLayerParentKids = clickedLayerParent.children;
                        const visibility = map.getLayoutProperty(clickedLayer, 'visibility');
                        e.preventDefault();
                        e.stopPropagation();

                        if (visibility === 'visible' && !this.classList.contains('unavailable')) {
                            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                            this.className = '';
                        } else if (!this.classList.contains('unavailable')) {
                            // We don't want the user to have more than one Flow Detail layer showing at time, so we need to turn off any Flow Detail layers before loading a new one.
                            if (clickedLayerParent.id === 'streams') {
                                clickedLayerParentKids.forEach(function(kid) {
                                    if (!kid.classList.contains('unavailable')) { // Don't change anything if the button is unavailable (leave it unavailable)
                                        kid.className = '';
                                        map.setLayoutProperty(kid.innerHTML, 'visibility', 'none');
                                    }
                                });
                            }
                            this.className = 'active';
                            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                        }
                    };
                    let layerToggleList = document.getElementById(elementTarget);
                    layerToggleList.appendChild(mapLayerButton);
                });
            },
            createLayerMenu() {
                const self = this;

                let correctDiv = document.getElementById('map');
                let mapLayersToggleContainer = document.createElement('div');
                let toggleOptions = document.createElement('div');
                let toggleTitleContainer = document.createElement('div');
                let toggleTitle = document.createElement('div');
                let toggleExit = document.createElement('div');
                let exitIcon = document.createElement('span');
                exitIcon.innerHTML = icon({ prefix: 'fas', iconName: 'times' }).html;
                let mapLayers = document.createElement('div');
                let flowDetail = document.createElement('div');
                let streams = document.createElement('div');
                //Add ids and classes
                mapLayersToggleContainer.id = 'mapLayersToggleContainer';
                toggleTitleContainer.id = 'toggleTitleContainer';
                toggleTitleContainer.className = 'layersTitle';
                toggleTitle.id = 'toggleTitle';
                toggleExit.id = 'toggleExit';
                toggleOptions.id = 'toggleOptions';
                mapLayers.id = 'mapLayers';
                flowDetail.id = 'flowDetail';
                flowDetail.className = 'layersTitle';
                mapLayers.className = 'options';
                streams.id = 'streams';
                streams.className = 'options';

                toggleTitle.innerHTML = 'Map Options';
                flowDetail.innerHTML = 'Flow Detail';
                mapLayersToggleContainer.style.display = 'none';

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
                };
                toggleExit.onclick = function(e){
                    e.stopPropagation();
                    self.contentToggle(mapLayersToggleContainer);
                };
                document.body.onclick = function(){
                    if(mapLayersToggleContainer.style.display === 'block'){
                        self.contentToggle(mapLayersToggleContainer);
                    }
                };
            },
            getIdListFromStyleLayersBasedOnTargetProperty(styleLayers, targetPropertyFromStylesheet) {
                let layerIds = [];

                styleLayers.forEach(function(layer) {
                    if (layer[targetPropertyFromStylesheet]) {
                        layerIds.push(layer.id);
                    }
                });
                return layerIds
            },
            getSortedIdsForLayersOffWhenPageLoads(styleLayers, targetPropertyFromStylesheet) {
                let layerIds = [];

                styleLayers.forEach(function(layer) {
                    if (layer[targetPropertyFromStylesheet] && layer.layout.visibility === 'none') {
                        layerIds.push(layer.id);
                    }
                });
                return layerIds;
            },
            populateLayerMenuGroupsAndButtons(googleAnalytics) {
                const styleLayers =  Object.values(mapStyles.style.layers);
                const toggleableLayerIds = this.getIdListFromStyleLayersBasedOnTargetProperty(styleLayers, 'showButtonLayerToggle');
                const toggleableStreamsIds = this.getIdListFromStyleLayersBasedOnTargetProperty(styleLayers, 'showButtonStreamToggle');
                const layersTurnedOffAtStart = this.getSortedIdsForLayersOffWhenPageLoads(styleLayers, 'showButtonLayerToggle');
                const streamsTurnedOffAtStart = this.getSortedIdsForLayersOffWhenPageLoads(styleLayers, 'showButtonStreamToggle');

                this.createLayerButtons(toggleableLayerIds, layersTurnedOffAtStart, 'mapLayers',  googleAnalytics);
                this.createLayerButtons(toggleableStreamsIds, streamsTurnedOffAtStart, 'streams', googleAnalytics);
            },
            runGoogleAnalytics(eventName, action, label) {
                this.$ga.set({ dimension2: Date.now() });
                this.$ga.event(eventName, action, label);
            },
            toggleMapInfoBox() {
                !this.isFirstClick ? this.isAboutMapInfoBoxOpen = !this.isAboutMapInfoBoxOpen : null;
            },
            usStateColor: function(percentWaterArea) {
                return percentWaterArea > 30 ? '#09203F' :
                        percentWaterArea > 20 ? '#2B445C' :
                        percentWaterArea > 10 ? '#4D6879' :
                        percentWaterArea > 5 ? '#6F8C97' :
                        percentWaterArea > 1 ? '#91B0B4' :
                        '#B3D5D2';
            },
            usStateExtrusionHeight: function(percentWaterArea) {
                return percentWaterArea * 10000;
            },
            onMapLoaded(event) {
                this.$store.map = event.map; // The 'event' gives us access to the map as an object but only after the map has loaded. Once we have that, we add the map object to the Vuex store
                const map = this.$store.map;
                let googleAnalytics = this.runGoogleAnalytics; // We need to get the global Google Analytics (GA) plugin object 'this.$ga' into this scope, so let's make a local variable and assign our GA event tracking method to that.
                map.resize(); //This solves the mysterious whitespace by resizing the map to the correct size.
                map.touchZoomRotate.enable(); // Allow users to pinch to zoom on touch devices.
                map.touchZoomRotate.disableRotation(); // Disable the rotation functionality, but keep pinch to zoom.
                map.fitBounds([[-125.3321, 23.8991], [-65.7421, 49.4325]]); // Once map is loaded, zoom in a bit more so that the map neatly fills the screen.
                setTimeout(() => { this.isLoading = false; }, 200);// Set a timeout to make sure the fitbounds action is completely done before loading screen fades away.
                map.on('zoomend', this.addZoomLevelIndicator); // Add the current zoom level display. The zoom level should only show in 'development' versions of the application.
                this.createLayerMenu();
                this.populateLayerMenuGroupsAndButtons(googleAnalytics);


                map.addSource('waterAreaByState', {
                    'type': 'geojson',
                    'data': waterAreaByState.statesData
                });
                const styleObjectUsStateOutline = {
                    'id': 'states-outline',
                    'type': 'line',
                    'source': 'waterAreaByState',
                    'paint': {
                        'line-color': 'rgba(57, 79, 87, 0.9)'
                    }
                };

                map.addLayer(styleObjectUsStateOutline);

                waterAreaByState.statesData.features.forEach(feature => {
                    const layerID = feature.properties.name;
                    const color = this.usStateColor(feature.properties.percentWaterArea);
                    const extrusionHeight = this.usStateExtrusionHeight(feature.properties.percentWaterArea);
                    if(!map.getLayer(layerID)) {
                        const styleObject = {
                            'id': layerID,
                            'source': 'waterAreaByState',
                            'type': 'fill-extrusion',
                            'filter': ['==', 'name', layerID],
                            'paint': {
                                'fill-extrusion-color': color,
                                'fill-extrusion-height': extrusionHeight,
                                'fill-extrusion-opacity': .9
                            }
                        };

                        map.addLayer(styleObject);
                    }
                });
            }
        }
    };
</script>

<style scoped lang='scss'>
  @import '~mapbox-gl/dist/mapbox-gl.css';
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
    border: none;
    border-left: $borderGray;
    &:hover{
      background: #00bf26;
      color: #fff;
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
<style lang='scss'>
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

    .unavailable {
      background: #7f8da3;
      opacity: .7;
      color: #a0aec4;
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
