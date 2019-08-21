export default {
    style: {
        version: 8,
        sources: {
            basemap: {
                type: 'vector',
                // This URL will pull the basemap GeoJson from S3 so that no local tile server is required.
                // NOTE: this location is under development and may change. If you suddenly lose parts of the map, it
                // may be that we have moved the tiles to a new location on S3.
                'tiles': ['https://d38anyyapxci3p.cloudfront.net/baseTiles_3/{z}/{x}/{y}.pbf']
                // url: 'http://localhost:8086/data/basemap.json'
                // The above URL is an example for using a local mbtiles file and a tile server. See the readme for more
                // information: https://github.com/usgs-makerspace/wbeep-viz#start-run-the-tile-server
            },
            HRU: {
                type: 'vector',
                // This URL will pull the Hydrological Response Units(HRUs) GeoJson from S3 so that no local tile server
                // is required.
                // NOTE: this location is under development and may change. If you suddenly lose your HRUs from the map, it
                // may be that we have moved the HRU tiles to a new location on S3.
                'tiles': ['https://d38anyyapxci3p.cloudfront.net/testTiles_5/{z}/{x}/{y}.pbf']
                // url: 'http://localhost:8085/data/new2.json'
                // The above URL is an example for using a local mbtiles file and a tile server. See the readme for more
                // information: https://github.com/usgs-makerspace/wbeep-viz#start-run-the-tile-server
            }
        },
        'sprite': '',
        'glyphs': 'https://orangemug.github.io/font-glyphs/glyphs/{fontstack}/{range}.pbf',
        'layers': [
            {
                'id': 'Background',
                'type': 'background',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'background-color': 'rgba(233, 245, 245, 0.5)'
                },
                'showButton': true
            },
            {
                'id': 'State Color Fill',
                'type': 'fill',
                'source': 'basemap',
                'source-layer': 'states',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'fill-color': 'rgba(246, 246, 244, 1)',
                },
                'showButton': true
            },
            {
                'id': 'HRUS Fill Colors',
                'type': 'fill',
                'source': 'HRU',
                'source-layer': 'hrus',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'fill-color': {
                        'property': 'SoilMoisture',
                        'type': 'categorical',
                        'stops': [
                            ['very high','#144873'],
                            ['high','#A7B9D7'],
                            ['average','#FED98E'],
                            ['low', '#EDAA5F'],
                            ['very low','#CC4C02'],
                            ["",'#000000'],
                        ]
                    },
                    'fill-opacity': ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.1,
                        1
                    ]
                },
                'showButton': true
            },

            {
                'id': 'HRUS Outlines',
                'type': 'line',
                'source': 'HRU',
                'source-layer': 'hrus',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': {
                        'property': 'SoilMoisture',
                        'type': 'categorical',
                        'stops': [
                            ["",'#000000'],
                            ['very low','#823102'],
                            ['low', '#C28C4E'],
                            ['average','#D0B275'],
                            ['high','#8998B0'],
                            ['very high','#113B5F'],
                        ]
                    },
                    'line-width': 1
                },
                'showButton': true
            },
            {
                'id': 'Neighboring Countries',
                'type': 'fill',
                'source': 'basemap',
                'source-layer': 'neighboringcountry',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'fill-color': 'rgba(237, 236, 232, 1)'
                },
                'showButton': true
            },
            {
                'id': 'Rivers',
                'type': 'line',
                'source': 'basemap',
                'source-layer': 'USA_Rivers_and_Streams',
                'minzoom': 5,
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': 'rgba(115, 255, 255, 1)'
                },
                'showButton': true
            },
            {
                'id': 'Counties Borders',
                'type': 'line',
                'source': 'basemap',
                'source-layer': 'counties',
                'minzoom': 6,
                'maxzoom': 24,
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': 'rgba(218, 234, 240, 1)'
                },
                'showButton': true
            },
            {
                'id': 'State Borders',
                'type': 'line',
                'source': 'basemap',
                'source-layer': 'states',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'line-color': 'rgba(218, 234, 240, 1)',
                    'line-dasharray': [
                        2,
                        1.5
                    ]
                },
                'showButton': true
            },
            {
                'id': 'Cities Dots',
                'type': 'circle',
                'source': 'basemap',
                'source-layer': 'Cities_and_Towns_NTAD',
                'minzoom': 6,
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'circle-radius': 4
                },
                'showButton': true
            },
            {
                'id': 'Cities Names',
                'type': 'symbol',
                'source': 'basemap',
                'source-layer': 'Cities_and_Towns_NTAD',
                'minzoom': 6,
                'layout': {
                    'visibility': 'visible',
                    'text-field': '{NAME}',
                    'text-font': [
                        'Roboto Regular'
                    ],
                    'text-size': 12,
                    'symbol-placement': 'point',
                    'text-line-height': 1.2,
                    'text-justify': 'center',
                    'text-anchor': 'bottom',
                    'text-offset': [
                        0,
                        -0.5
                    ]
                },
                'paint': {
                    'text-color': 'rgba(255,255,255, 1)',
                    'text-halo-width': 1,
                    'text-halo-blur': 1,
                    'text-halo-color': 'rgba(0, 0, 0, 0.5)',
                },
                'showButton': true
            }
        ]
    }
};