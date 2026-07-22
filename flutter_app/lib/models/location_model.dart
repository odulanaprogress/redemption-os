class LocationItem {
  final String id;
  final String name;
  final String category;
  final double lat;
  final double lng;

  const LocationItem({
    required this.id,
    required this.name,
    required this.category,
    required this.lat,
    required this.lng,
  });
}

const List<LocationItem> rccgLocations = [
  LocationItem(id: 'main-auditorium', name: 'Main Auditorium (3km Arena)', category: 'auditorium', lat: 6.802180, lng: 3.447898),
  LocationItem(id: 'old-auditorium', name: 'Old Arena (Holy Ghost Ground)', category: 'auditorium', lat: 6.806212, lng: 3.448512),
  LocationItem(id: 'main-gate', name: 'Main Entrance (Express Gate)', category: 'gate', lat: 6.827492, lng: 3.462833),
  LocationItem(id: 'youth-centre', name: 'Youth Centre & Arena', category: 'facility', lat: 6.826513, lng: 3.466368),
  LocationItem(id: 'medical-centre', name: 'RCCG Health Village Center', category: 'facility', lat: 6.797173, lng: 3.446082),
  LocationItem(id: 'bookshop', name: 'CRM Bookshop & Superstore', category: 'facility', lat: 6.816031, lng: 3.454903),
  LocationItem(id: 'supermarket', name: 'CRM SuperMarket & Canteen', category: 'food', lat: 6.819025, lng: 3.458024),
  LocationItem(id: 'car-park-c', name: 'Car Park C (Shuttle Hub)', category: 'transit', lat: 6.810633, lng: 3.445525),
  LocationItem(id: 'police-station', name: 'Redemption City Police Post', category: 'office', lat: 6.827011, lng: 3.463520),
  LocationItem(id: 'fire-station', name: 'RCCG Fire & Safety Station', category: 'facility', lat: 6.812543, lng: 3.451012),
  LocationItem(id: 'redeemers-university', name: "Redeemer's University (RUN Campus)", category: 'facility', lat: 6.829512, lng: 3.471243),
  LocationItem(id: 'white-house-suite', name: 'White House Suite', category: 'hostel', lat: 6.809450, lng: 3.458073),
];
