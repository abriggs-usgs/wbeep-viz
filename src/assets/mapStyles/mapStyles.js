export default {
    'style': {
        'version': 8,
        'sources': {
            'basemap': {
                'type': 'vector',
                'url': 'http://localhost:8086/data/basemap.json'
            },
            'HRU': {
                'type': 'vector',
                'url': 'http://localhost:8085/data/new2.json'
                // amazon S3 'tiles': ['http://wbeep-test-website.s3-website-us-west-2.amazonaws.com/tiles/{z}/{x}/{y}.pbf'],
                // locally, you can run tileserver https://www.npmjs.com/package/tileserver-gl-light
                // host the tiles in the /tiles dir with tileserver-gl-light /path/to/repo/tiles/new2.mbtiles -p 8085
                // then change the line above to have the map look for local tileserver instead of s3 path
                // url: 'http://127.0.0.1:8085/data/new2.json'
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
                    'background-color': 'rgba(202, 210, 211, 1)'
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
                'id': 'Neighboring Countries',
                'type': 'fill',
                'source': 'basemap',
                'source-layer': 'neighboringcountry',
                'layout': {
                    'visibility': 'visible'
                },
                'paint': {
                    'fill-color': 'rgba(246, 246, 244, 1)'
                },
                'showButton': true
            },
            {
                'id': 'HRUS Fill Colors',
                'type': 'fill',
                'source': 'HRU',
                'source-layer': 'no_simp_prec5',
                'layout': {
                    'visibility': 'visible'
                },
                'generateId': true,
                'paint': {
                    'fill-color': {
                        'property': 'SoilMoisture',
                        'type': 'categorical',
                        'stops': [
                            ["",'#000000'],
                            ['very low','#CC4C02'],
                            ['low', '#EDAA5F'],
                            ['average','#FED98E'],
                            ['high','#A7B9D7'],
                            ['very high','#144873'],
                        ]
                    },
                    'fill-opacity': ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.5,
                        1
                    ]
                },
                'showButton': true
            },

            {
                'id': 'HRUS Outlines',
                'type': 'line',
                'source': 'HRU',
                'source-layer': 'no_simp_prec5',
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
                    'line-color': 'rgba(115, 255, 255, 1)'
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
                    'line-color': 'rgba(115, 255, 255, 1)',
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
