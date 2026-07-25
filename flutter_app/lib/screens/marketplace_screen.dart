import 'package:flutter/material.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  String _selectedCategory = 'All';
  int _cartCount = 0;
  final List<Map<String, dynamic>> _cart = [];

  final List<String> _categories = [
    'All',
    'Food & Drinks',
    'Books',
    'Religious Materials',
    'Apparel',
    'Electronics',
  ];

  final List<Map<String, dynamic>> _products = [
    {
      'id': '1',
      'name': 'Camp Meal Pack (Jollof & Chicken)',
      'vendor': 'Redemption Kitchens',
      'price': 3500,
      'category': 'Food & Drinks',
      'eta': '15 mins',
      'verified': true,
      'stock': 'In Stock',
      'icon': Icons.fastfood_outlined,
    },
    {
      'id': '2',
      'name': 'Holy Ghost Congress Devotional 2024',
      'vendor': 'RCCG Publications',
      'price': 2000,
      'category': 'Books',
      'eta': 'Same Day',
      'verified': true,
      'stock': 'In Stock',
      'icon': Icons.menu_book_outlined,
    },
    {
      'id': '3',
      'name': 'Anointing Oil Bottle (100ml)',
      'vendor': 'Grace Essentials',
      'price': 1500,
      'category': 'Religious Materials',
      'eta': '20 mins',
      'verified': true,
      'stock': 'In Stock',
      'icon': Icons.sanitizer_outlined,
    },
    {
      'id': '4',
      'name': 'Redemption OS Commemorative T-Shirt',
      'vendor': 'Holy Ghost Apparel',
      'price': 5000,
      'category': 'Apparel',
      'eta': '30 mins',
      'verified': true,
      'stock': 'Low Stock',
      'icon': Icons.checkroom_outlined,
    },
    {
      'id': '5',
      'name': 'Portable Powerbank 10,000mAh',
      'vendor': 'Camp TechHub',
      'price': 8500,
      'category': 'Electronics',
      'eta': '10 mins',
      'verified': true,
      'stock': 'In Stock',
      'icon': Icons.battery_charging_full_outlined,
    },
  ];

  void _addToCart(Map<String, dynamic> product) {
    setState(() {
      _cart.add(product);
      _cartCount = _cart.length;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${product['name']} added to cart!'),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF5B4FE8),
      ),
    );
  }

  void _showCartModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        final total = _cart.fold<int>(0, (sum, item) => sum + (item['price'] as int));
        return Container(
          padding: const EdgeInsets.all(20),
          height: MediaQuery.of(context).size.height * 0.6,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Your Cart & Delivery', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                ],
              ),
              const Divider(),
              Expanded(
                child: _cart.isEmpty
                    ? const Center(child: Text('Your cart is empty', style: TextStyle(color: Colors.grey)))
                    : ListView.builder(
                        itemCount: _cart.length,
                        itemBuilder: (context, index) {
                          final item = _cart[index];
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFFEDE9FE),
                              child: Icon(item['icon'] as IconData, color: const Color(0xFF5B4FE8)),
                            ),
                            title: Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: Text('Vendor: ${item['vendor']} • ETA: ${item['eta']}'),
                            trailing: Text('₦${item['price']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF5B4FE8))),
                          );
                        },
                      ),
              ),
              const Divider(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  Text('₦$total', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF5B4FE8))),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _cart.isEmpty
                      ? null
                      : () {
                          Navigator.pop(context);
                          setState(() {
                            _cart.clear();
                            _cartCount = 0;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Order placed successfully! Delivery tracking active.'),
                              backgroundColor: Color(0xFF10B981),
                            ),
                          );
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5B4FE8),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('CONFIRM ORDER & TRACK DELIVERY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedCategory == 'All'
        ? _products
        : _products.where((p) => p['category'] == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Verified Marketplace', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          Stack(
            children: [
              IconButton(
                onPressed: _showCartModal,
                icon: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF0D0D0D)),
              ),
              if (_cartCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: CircleAvatar(
                    radius: 9,
                    backgroundColor: const Color(0xFFEF4444),
                    child: Text(
                      '$_cartCount',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Category selector bar
          Container(
            color: Colors.white,
            height: 52,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: const Color(0xFFEDE9FE),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF5B4FE8) : Colors.black87,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                    onSelected: (val) => setState(() => _selectedCategory = cat),
                  ),
                );
              },
            ),
          ),

          const Divider(height: 1),

          // Product list grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.72,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final item = filtered[index];
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(color: Colors.grey.shade100, blurRadius: 6, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDE9FE).withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(item['icon'] as IconData, size: 48, color: const Color(0xFF5B4FE8)),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item['vendor'],
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const Icon(Icons.verified, size: 12, color: Color(0xFF10B981)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item['name'],
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0D0D0D)),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('₦${item['price']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF5B4FE8))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(6)),
                            child: Text(item['eta'], style: const TextStyle(fontSize: 9, color: Colors.grey)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        height: 32,
                        child: ElevatedButton(
                          onPressed: () => _addToCart(item),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF5B4FE8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: EdgeInsets.zero,
                          ),
                          child: const Text('Add to Cart', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
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
