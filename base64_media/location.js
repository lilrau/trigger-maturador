// Latitude: de -90 a 90
const latitude = (Math.random() * 180 - 90).toFixed(6); 

// Longitude: de -180 a 180
const longitude = (Math.random() * 360 - 180).toFixed(6); 

// Lista de possíveis localizações com nomes
const locations = [
  {
    json: {
      latitude,
      longitude,
      name: "Location"
    }
  },
  {
    json: {
      latitude: 48.85837,
      longitude: 2.294481,
      name: "Party"
    }
  },
  {
    json: {
      latitude: 40.7128,
      longitude: -74.0060,
      name: "New York"
    }
  },
  {
    json: {
      latitude: -22.9068,
      longitude: -43.1729,
      name: "Rio de Janeiro"
    }
  }
];

// Retorna uma localização aleatória ou a lista completa
return locations;