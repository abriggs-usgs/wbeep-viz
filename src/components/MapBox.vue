<template>
  <div id="visualization">
    <div id="map" />
    <MglMap
            container="map-test"
            :center.sync="center"
            :mapStyle="mapStyle"
    >
    </MglMap>
  </div>
</template>

<script>
  import Mapbox from "mapbox-gl";
  import { MglMap } from "vue-mapbox";


  var style = {
    version: 8,
    sources: {
      HRU: {
        type: "vector",
        url: 'http://localhost:8082/data/geoTilesNoSimpPrec5.json'
      }
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#ddeeff"
        }
      },
      {
        id: "HRUS",
        type: "line",
        source: "HRU",
        "source-layer": "no_simp_prec5",
        paint: {
          "line-color": "#000000",
          "line-width": 1
        }
      }
    ]
  }

  export default {
    name: 'Visualization',
    components: {
      MglMap
    },
    data() {
      return {
        mapStyle: {
          version: 8,
          sources: {
            HRU: {
              type: "vector",
              url: 'http://localhost:8082/data/geoTilesNoSimpPrec5.json'
            }
          },
          layers: [
            {
              id: "background",
              type: "background",
              paint: {
                "background-color": "#ddeeff"
              }
            },
            {
              id: "HRUS",
              type: "line",
              source: "HRU",
              "source-layer": "no_simp_prec5",
              paint: {
                "line-color": "#000000",
                "line-width": 1
              }
            }
          ]
        }
      }
    },
    mounted() {
      this.createMap();
    },
    methods: {
      createMap() {
        // init the map
        this.map = new Mapbox.Map({
          container: 'map',
          style: style,
          zoom: 4,
          minZoom: 4,
          maxZoom: 8,
          center: [-95.7129, 37.0902],
        });
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '~mapbox-gl/dist/mapbox-gl.css';
  #map{
    height: 900px;
  }
</style>

