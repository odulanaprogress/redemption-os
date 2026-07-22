import 'package:flutter/material.dart';

class MarketplaceScreen extends StatelessWidget {
  const MarketplaceScreen({super.key});

  final List<Map<String, String>> mockVendors = const [
    {
      'name': 'Grace Kitchen & Refreshments',
      'category': 'Food & Beverages',
      'location': 'Zone C Marketplace',
      'rating': '4.9 (142 reviews)',
      'image': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
    },
    {
      'name': 'Redemption Bookshop & Bibles',
      'category': 'Books & Bibles',
      'location': 'Main Sanctuary Plaza',
      'rating': '4.8 (89 reviews)',
      'image': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80',
    },
    {
      'name': 'Anointing Oil & Sacraments',
      'category': 'Sacraments & Oil',
      'location': 'Zone B Food Court',
      'rating': '5.0 (310 reviews)',
      'image': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80',
    },
    {
      'name': 'Holy Ghost Souvenirs & Apparel',
      'category': 'Souvenirs & Gifts',
      'location': 'Youth Centre Mall',
      'rating': '4.7 (64 reviews)',
      'image': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Redemption City Marketplace', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF5B4FE8)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            TextField(
              decoration: InputDecoration(
                hintText: 'Search vendors, food, or books...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              ),
            ),
            const SizedBox(height: 20),

            const Text('Verified Camp Vendors', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0D0D0D))),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: mockVendors.length,
              itemBuilder: (context, index) {
                final v = mockVendors[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(v['image']!, width: 70, height: 70, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(v['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0D0D0D))),
                              const SizedBox(height: 4),
                              Text('${v['category']} • ${v['location']}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.star, color: Colors.amber, size: 14),
                                  const SizedBox(width: 4),
                                  Text(v['rating']!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0D0D0D))),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: Colors.grey),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
