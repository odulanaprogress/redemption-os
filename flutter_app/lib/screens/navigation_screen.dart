import 'package:flutter/material.dart';
import '../models/location_model.dart';

class NavigationScreen extends StatefulWidget {
  const NavigationScreen({super.key});

  @override
  State<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'all';

  List<LocationItem> get _filteredLocations {
    return rccgLocations.where((loc) {
      final matchesCategory = _selectedCategory == 'all' || loc.category == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty || loc.name.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'auditorium':
        return Colors.purple;
      case 'gate':
        return Colors.lightBlue;
      case 'facility':
        return Colors.emerald;
      case 'food':
        return Colors.amber;
      case 'transit':
        return Colors.grey;
      case 'hostel':
        return Colors.pink;
      case 'office':
        return Colors.blue;
      default:
        return Colors.deepPurple;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Smart Navigation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0D0D0D))),
            Text('Redemption City — 28 Mapped Places', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF0D0D0D)),
      ),
      body: Column(
        children: [
          // Search & Filter header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search Auditorium, Gate, Hospital...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    filled: true,
                    fillColor: const Color(0xFFF8F9FF),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['all', 'auditorium', 'gate', 'facility', 'food', 'transit', 'hostel', 'office'].map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: FilterChip(
                          label: Text(cat.toUpperCase()),
                          selected: isSelected,
                          onSelected: (_) => setState(() => _selectedCategory = cat),
                          selectedColor: const Color(0xFF0D0D0D),
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                          backgroundColor: Colors.grey.shade100,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Map Header Banner
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF5B4FE8), Color(0xFF8B82F0)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: const Color(0xFF5B4FE8).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.satellite_alt, color: Colors.white, size: 32),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Esri Satellite & Live Telemetry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      SizedBox(height: 2),
                      Text('GPS Bounded strictly to Redemption City (6.79N–6.83N)', style: TextStyle(color: Colors.white70, fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Locations list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _filteredLocations.length,
              itemBuilder: (context, index) {
                final loc = _filteredLocations[index];
                final color = _getCategoryColor(loc.category);
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 1,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: color.withOpacity(0.15),
                      child: Icon(Icons.location_on, color: color),
                    ),
                    title: Text(loc.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    subtitle: Text('Lat: ${loc.lat.toStringAsFixed(4)}, Lng: ${loc.lng.toStringAsFixed(4)}', style: const TextStyle(fontSize: 12)),
                    trailing: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Starting GPS Turn-by-Turn Navigation to ${loc.name}')),
                        );
                      },
                      icon: const Icon(Icons.navigation, size: 14),
                      label: const Text('Navigate'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5B4FE8),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
