<template>
  <div id="viz_container">
    <div class="usa-prose">
      <h2 class="title-text">
        {{ title }}
      </h2>
    </div>
    <hr>

    <nav id="menu" />
    <MglMap
      id="map"
      :container="container"
      :map-style="mapStyle"
      :zoom="zoom"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :center="center"
      :access-token="accessToken"
      @load="onMapLoaded"
    >
      <MglRasterLayer
        :source-id="rasterSource.id"
        :source="rasterSource"
        layer-id="hillshading"
        :layer="rasterLayer"
      />
      <MglScaleControl
        position="bottom-right"
        unit="imperial"
      />
      <MglNavigationControl
        position="bottom-right"
        :show-compass="false"
      />
      <MglGeolocateControl
        position="bottom-right"
      />
      <MglFullscreenControl
        position="bottom-right"
      />
    </MglMap>
  </div>
</template>

<script>
    import {
        MglMap,
        MglRasterLayer,
        MglNavigationControl,
        MglGeolocateControl,
        MglFullscreenControl,
        MglScaleControl
    } from "vue-mapbox";
    import mapStyles from '../assets/mapStyles/mapStyles';

    export default {
        name: 'MapBox',
        components: {
            MglMap,
            MglRasterLayer,
            MglNavigationControl,
            MglGeolocateControl,
            MglFullscreenControl,
            MglScaleControl
        },
        props: {
            title: {
                type: String,
                default: 'Add your title in App.vue or make this blank'
            }
        },
        data() {
            return {
                mapStyle: mapStyles.style,
                container: 'map',
                zoom: 4,
                minZoom: 4,
                maxZoom: 8,
                center: [-95.7129, 37.0902],
                hoveredHRUId: null,
                accessToken: 'pk.eyJ1IjoiYWJyaWdncyIsImEiOiJjandrd3J4bmMwcjNpNGFxZ2hoZGE2djR5In0.gKPNdhLzvbzui4aiIwAihA',
                rasterSource: {'id': 'dem',
                    "type": "raster-dem",
                    "url": "mapbox://mapbox.terrain-rgb"
                },
                rasterLayer: {'id': 'hillshading',
                    'type': 'hillshade',
                    'source': 'dem',
                    'showButton': true}
            }
        },
        methods: {
            onMapLoaded(event) {
                let map = event.map; // This gives us access to the map as an object but only after the map has loaded

                // Next section gives us names for the layer toggle buttons
                let styleLayers = Object.values(mapStyles.style.layers); // Pulls the layers out of the styles object as an array
                let toggleableLayerIds = [];

                for (let index = 0; index < styleLayers.length; index++) {
                    if (styleLayers[index].showButton === true) { // note: to NOT show a layer, change the 'showButton' property in the mapStyles.js to false
                        toggleableLayerIds.push(styleLayers[index].id)
                    }
                }

                // Go through each layer id that is in the array and make a button element for it
                for (let i = 0; i < toggleableLayerIds.length; i++) {
                    let id = toggleableLayerIds[i];

                    let link = document.createElement('button');
                    link.href = '#';
                    link.className = 'active';
                    link.className = 'usa-button--accent-cool'; // adds USWDS button style to element
                    link.textContent = id;

                    // Creates a click event for each button so that when clicked by the user, the visibility property
                    // is changed as is the class (color) of the button
                    link.onclick = function (e) {
                        let clickedLayer = this.textContent;
                        e.preventDefault();
                        e.stopPropagation();

                        let visibility = map.getLayoutProperty(clickedLayer, 'visibility');

                        if (visibility === 'visible') {
                            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                            this.className = '';
                            this.className = 'usa-button--base'; // adds USWDS button style to element
                        } else {
                            this.className = 'active';
                            this.className = 'usa-button--accent-cool';
                            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                        }
                    };

                    // Add the toggle layer buttons to the 'menu' element
                    let layers = document.getElementById('menu');
                    layers.appendChild(link);
                }
            }
        }
    }
</script>


<style scoped lang="scss">
  @import"~mapbox-gl/dist/mapbox-gl.css";

  #map {
    height: 60vh;
  }

  /* override USWDS style to prevent title from wrapping too soon */
  .title-text {
    margin-left: 1.5rem;
    padding-top: 0.5rem;
  }

  /* make the line below the title stay off the title but snug up to the map */
  hr {
    margin: 2px 0 0 0;
    padding-bottom: 0;
  }

</style>

