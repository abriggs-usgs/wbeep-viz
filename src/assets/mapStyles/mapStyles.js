// Since the Mapbox gl wants the tile request to have an array containing the URL for the tiles, we need to
// grab the URL for the correct tier from the environment variables and prepackage the result as an array
const hruTileUrl = [];
    hruTileUrl.push(process.env.VUE_APP_HRU_TILE_URL);

export default {
    style: {
        version: 8,
        sources: {
            basemap: {
                type: 'vector',
                'tiles': ['https://maptiles-prod-website.s3-us-west-2.amazonaws.com/misctilesets/usstatecounties/{z}/{x}/{y}.pbf'],
                'minzoom': 2, // setting this to equal the minzoom of main map, real tile extent is 2
                'maxzoom': 6  // setting this to equal the maxzoom of main map, real tile extent is 10
            },
            HRU: {
                type: 'vector',
                'tiles': hruTileUrl,
                'minzoom': 2, // setting this to equal the minzoom of main map, real tile extent is 0
                'maxzoom': 6  // setting this to equal the maxzoom of main map, real tile extent is 11
            },
            nhd_streams_grouped: {
                type: 'vector',
                'tiles':['https://maptiles-prod-website.s3-us-west-2.amazonaws.com/nhdstreams_grouped/{z}/{x}/{y}.pbf'],
                'minzoom': 2, // setting this to equal the minzoom of main map, real tile extent is 0
                'maxzoom': 6  // setting this to equal the maxzoom of main map, real tile extent is 10
            },
            openmaptiles: {
                type: 'vector',
                'tiles': ['https://maptiles-prod-website.s3-us-west-2.amazonaws.com/openmaptiles/baselayers/{z}/{x}/{y}.pbf'],
                'minzoom': 0,
                'maxzoom': 14
            },
            hillshade: {
                type: 'raster',
                'tiles': ['https://maptiles-prod-website.s3-us-west-2.amazonaws.com/openmaptiles/omthillshade/{z}/{x}/{y}.png'],
                'minzoom': 0,
                'maxzoom': 12,
                'tileSize': 256
            },
            monitoring_location_summary: {
                type: 'geojson',
                data: 'http://maptiles-prod-website.s3-us-west-2.amazonaws.com/geojson/delaware_site_summary.geojson',
                cluster: true,
                clusterMaxZoom: 8,
                clusterRadius: 50
            },
        },
        'sprite': '',
        'glyphs': 'https://orangemug.github.io/font-glyphs/glyphs/{fontstack}/{range}.pbf',
        'layers': [
            {
                'id': 'background',
                'paint': {
                    'background-color': 'hsl(47, 26%, 88%)'
                },
                'type': 'background',
                'showButtonLayerToggle': false
            },
            {
                'id': 'HRUs',
                'type': 'fill',
                'source': 'HRU',
                'source-layer': 'hrus',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'fill-color': {
                        'property': 'value',
                        'type': 'categorical',
                        'stops': [
                            ['very high','#1C2040'],
                            ['high','#337598'],
                            ['average','#C8D3BA'],
                            ['low', '#BDAD9D'],
                            ['very low','#967a4a']
                        ]
                    },
                    'fill-opacity': ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.7,
                        1
                    ]
                },
                'showButtonLayerToggle': false,
                'legendText': {
                    'very high': ['Very High'],
                    'high': ['High'],
                    'average': ['Normal'],
                    'low': ['Low'],
                    'very low': ['Very Low']
                }
            },
            {
                'filter': ['all', ['==', '$type', 'LineString'],
                    ['in', 'class', 'minor', 'service', 'trunk', 'primary', 'secondary', 'tertiary', 'motorway']
                ],
                'id': 'Roads',
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round',
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': 'hsl(0, 0%, 97%)',
                    'line-width': {
                        'base': 1.55,
                        'stops': [
                            [4, 0.25],
                            [20, 30]
                        ]
                    }
                },
                'source': 'openmaptiles',
                'source-layer': 'transportation',
                'type': 'line',
                'minzoom': 5,
                'showButtonLayerToggle': true
            },
            {
                'filter': ['all', ['==', '$type', 'Polygon'],
                    ['==', 'intermittent', 1]
                ],
                'id': 'water_intermittent',
                'paint': {
                    'fill-color': 'hsl(205, 56%, 73%)',
                    'fill-opacity': 0.7
                },
                'source': 'openmaptiles',
                'source-layer': 'water',
                'type': 'fill',
                'layout': {
                    'visibility': 'visible'
                },
                'showButtonLayerToggle': false
            },
            {
                'filter': ['all', ['==', '$type', 'LineString'],
                    ['==', 'brunnel', 'tunnel']
                ],
                'id': 'waterway-tunnel',
                'paint': {
                    'line-color': 'hsl(205, 56%, 73%)',
                    'line-dasharray': [3, 3],
                    'line-gap-width': {
                        'stops': [
                            [12, 0],
                            [20, 6]
                        ]
                    },
                    'line-opacity': 1,
                    'line-width': {
                        'base': 1.4,
                        'stops': [
                            [8, 1],
                            [20, 2]
                        ]
                    }
                },
                'source': 'openmaptiles',
                'source-layer': 'waterway',
                'type': 'line',
                'layout': {
                    'visibility': 'visible'
                },
                'showButtonLayerToggle': false
            },
            {
                'filter': ['all', ['==', '$type', 'LineString'],
                    ['!in', 'brunnel', 'tunnel', 'bridge'],
                    ['!=', 'intermittent', 1]
                ],
                'id': 'waterway',
                'paint': {
                    'line-color': 'hsl(205, 56%, 73%)',
                    'line-opacity': 1,
                    'line-width': {
                        'base': 1.4,
                        'stops': [
                            [8, 1],
                            [20, 8]
                        ]
                    }
                },
                'source': 'openmaptiles',
                'source-layer': 'waterway',
                'type': 'line',
                'layout': {
                    'visibility': 'visible'
                },
                'showButtonLayerToggle': false
            },
            {
                'filter': ['all', ['==', '$type', 'LineString'],
                    ['!in', 'brunnel', 'tunnel', 'bridge'],
                    ['==', 'intermittent', 1]
                ],
                'id': 'waterway_intermittent',
                'paint': {
                    'line-color': 'hsl(205, 56%, 73%)',
                    'line-opacity': 1,
                    'line-width': {
                        'base': 1.4,
                        'stops': [
                            [8, 1],
                            [20, 8]
                        ]
                    },
                    'line-dasharray': [2, 1]
                },
                'source': 'openmaptiles',
                'source-layer': 'waterway',
                'type': 'line',
                'layout': {
                    'visibility': 'visible'
                },
                'showButtonLayerToggle': false
            },
            {
                'id': 'Least Detail',
                'layerDescription': 'contains stream orders 4-10',
                'type': 'line',
                'source': 'nhd_streams_grouped',
                'source-layer': 'least_detail',
                'minzoom': 0,
                'maxzoom': 24,
                'layout': {
                    'visibility': 'none'
                },
                'paint': {
                    'line-color': 'rgba(148, 193, 225, 1)'
                },
                'showButtonLayerToggle': false,
                'showButtonStreamToggle': true
            },
            {
                'id': 'Medium Detail',
                'layerDescription': 'contains stream orders 2-10',
                'type': 'line',
                'source': 'nhd_streams_grouped',
                'source-layer': 'medium_detail',
                'minzoom': 0,
                'maxzoom': 24,
                'layout': {
                    'visibility': 'none'
                },
                'paint': {
                    'line-color': 'rgba(148, 193, 225, 1)'
                },
                'showButtonLayerToggle': false,
                'showButtonStreamToggle': true
            },
            {
                'id': 'Most Detail',
                'layerDescription': 'contains stream orders 1-10',
                'type': 'line',
                'source': 'nhd_streams_grouped',
                'source-layer': 'most_detail',
                'minzoom': 0,
                'maxzoom': 24,
                'layout': {
                    'visibility': 'none'
                },
                'paint': {
                    'line-color': 'rgba(148, 193, 225, 1)'
                },

                'showButtonLayerToggle': false,
                'showButtonStreamToggle': true,
            },
            {
                'id': 'Hydrologic Response Unit',
                'type': 'line',
                'source': 'HRU',
                'source-layer': 'hrus',
                'layout': {
                    'visibility': 'none'
                },
                'paint': {
                    'line-color': 'rgba(57, 79, 87, 1)'
                },
                'showButtonLayerToggle': true,
                'showButtonStreamToggle': false
            },
            {
                'id': 'Neighboring Countries',
                'type': 'fill',
                'source': 'basemap',
                'minzoom': 2,
                'maxzoom': 24,
                'source-layer': 'neighboringcountry',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'fill-color': 'hsl(47, 26%, 88%)'
                },
                'showButtonLayerToggle': false
            },
            {
                'filter': ['all', ['==', '$type', 'Polygon'],
                    ['!=', 'intermittent', 1]
                ],
                'id': 'water',
                'paint': {
                    'fill-color': 'hsl(205, 56%, 73%)'
                },
                'source': 'openmaptiles',
                'source-layer': 'water',
                'type': 'fill',
                'layout': {
                    'visibility': 'visible'
                },
                'showButtonLayerToggle': false
            },
            {
                'id': 'Terrain',
                'type': 'raster',
                'source': 'hillshade',
                'layout': {
                    'visibility': 'visible'
                },
                'showButtonLayerToggle': true,
                'showButtonStreamToggle': false,
            },
            {
                'id': 'Counties',
                'type': 'line',
                'source': 'basemap',
                'source-layer': 'counties',
                'minzoom': 6,
                'maxzoom': 24,
                'layout': {
                    'visibility': 'none'
                },
                'paint': {
                    'line-color': 'rgb(0,0,0)',
                    'line-dasharray': [4, 3]
                },
                'showButtonLayerToggle': true
            },
            {
                'id': 'states',
                'type': 'line',
                'source': 'basemap',
                'source-layer': 'states',
                'minzoom': 2,
                'maxzoom': 24,
                'layout': {
                    'visibility': 'visible',
                },
                'paint': {
                    'line-color': 'rgb(0,0,0)'
                }

            },
            {
                'filter': ['all', ['==', '$type', 'Point'],
                    ['==', 'class', 'city']
                ],
                'id': 'place_label_city',
                'layout': {
                    'text-field': '{name:latin}\n{name:nonlatin}',
                    'text-font': ['Noto Sans Regular'],
                    'text-max-width': 10,
                    'text-size': {
                        'stops': [
                            [3, 12],
                            [8, 16]
                        ]
                    }
                },
                'maxzoom': 16,
                'minzoom': 5,
                'paint': {
                    'text-color': 'hsl(0, 0%, 0%)',
                    'text-halo-blur': 0,
                    'text-halo-color': 'hsla(0, 0%, 100%, 0.75)',
                    'text-halo-width': 2
                },
                'source': 'openmaptiles',
                'source-layer': 'place',
                'type': 'symbol',
                'showButtonLayerToggle': false
            },
            {
                'id': 'monitoring-location-clusters',
                'type': 'circle',
                'source': 'monitoring_location_summary',
                'layout': {
                    'visibility': 'visible'
                },
                'filter': ['has', 'point_count'],
                'paint': {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        'rgba(0, 87, 239, .25)', 100, // if less than 101 monitoring locations in the cluster, make it this color
                        'rgba(0, 106, 210, .5)', 750, // if there is less than 751 monitoring locations in the cluster make it this color
                        'rgba(0, 49, 74.9, .5)'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20, 100, // if there are less than 101 monitoring locations in the cluster, make it 20 px in radius
                        30, 750,
                        40
                    ]
                },
                'minzoom': 3,
                'maxzoom': 23,
                'showButtonLayerToggle': false,
                'showButtonStreamToggle': false,
                'showButtonProjectSpecific': false,
                'inLegend': false
            },
            {
                'id': 'monitoring-location-cluster-count',
                'type': 'symbol',
                'source': 'monitoring_location_summary',
                'filter': ['has', 'point_count'],
                'layout': {
                    'visibility': 'visible',
                    'text-field': '{point_count_abbreviated}',
                    'text-font': [
                        'Roboto Regular'
                    ],
                    'text-size': 12,
                    'symbol-placement': 'point'
                },
                'paint': {
                    'text-color': 'rgba(0,0,0, 1)',
                    'text-halo-width': 1,
                    'text-halo-blur': 1,
                    'text-halo-color': 'rgba(255,255,255, 1)',
                },
                'minzoom': 3,
                'maxzoom': 23,
                'showButtonLayerToggle': false,
                'showButtonStreamToggle': false,
                'showButtonProjectSpecific': false,
                'inLegend': false
            },
            {
                'id': 'monitoring-location-unclustered-point',
                'type': 'circle',
                'source': 'monitoring_location_summary',
                'layout': {
                    'visibility': 'visible'
                },
                'filter': ['!', ['has', 'point_count']],
                'paint': {
                    'circle-color':  {
                        'property': 'nobsBin',
                        'type': 'categorical',
                        'stops': [
                            ['1-10', '#A1F7FA'],
                            ['10-100','#6A6EE7'],
                            ['100-1000','#C239D4'],
                            ['1000+','#C10F32']
                        ]
                    },
                    'circle-radius': 4,                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#11b4da'
                },
                'minzoom': 3,
                'maxzoom': 23,
                'showButtonLayerToggle': false,
                'showButtonStreamToggle': false,
                'showButtonProjectSpecific': false,
                'inLegend': true
            },
            {
                'id': 'site names',
                'type': 'symbol',
                'source': 'monitoring_location_summary',
                'layout': {
                    'visibility': 'none',
                    'text-field': '{site_id} | {n_obs} | {latitude} | {longitude} | {source}',
                    'text-font': [
                        'Roboto Regular'
                    ],
                    'text-size': 12,
                    'symbol-placement': 'point',
                    'text-line-height': 1.2,
                    'text-justify': 'center',
                    'text-anchor': 'center',
                    'text-offset': [
                        0,
                        -1.5
                    ]
                },
                'paint': {
                    'text-color': 'rgba(0, 0, 0, 0.5)',
                    'text-halo-width': 1,
                    'text-halo-blur': 1,
                    'text-halo-color': 'rgba(255,255,255, 1)',
                },
                'minzoom': 3,
                'maxzoom': 23,
                'showButtonLayerToggle': false,
                'showButtonStreamToggle': false,
                'showButtonProjectSpecific': true,
                'inLegend': false
            },
        ]
    }
};
