/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiaW1zd2FneiIsImEiOiJjbTNvcWYzc3MwNGQwMmtxdXV3NWFpb2RlIn0.P9pc8aCL66RTjFx0BFJNNw';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/imswagz/cm3orc9la009a01s7ac2x4k32', // style URL
    scrollZoom: false,
    //   center: [-74.5, 40], // starting position [lng, lat]
    //   zoom: 9, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 125,
      left: 100,
      right: 100,
    },
  });
};
