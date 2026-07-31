import 'package:flutter/material.dart';
import 'navigation_screen.dart';
import 'messages_screen.dart';
import 'qr_identity_screen.dart';
import 'marketplace_screen.dart';
import 'emergency_screen.dart';
import 'ai_assistant_screen.dart';
import 'sermon_feed_screen.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      HomeDashboardTab(
        onSelectTab: (index) => setState(() => _currentIndex = index),
        onOpenEmergency: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const EmergencyScreen()));
        },
        onOpenAI: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AIAssistantScreen()));
        },
      ),
      const NavigationScreen(),
      const MarketplaceScreen(),
      const MessagesScreen(),
      const QRIdentityScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF5B4FE8),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.map_outlined), label: 'Navigation'),
          BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), label: 'Marketplace'),
          BottomNavigationBarItem(icon: Icon(Icons.hub_outlined), label: 'BitChat⚡'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code_2), label: 'QR Pass'),
        ],
      ),
    );
  }
}

class HomeDashboardTab extends StatelessWidget {
  final ValueChanged<int>? onSelectTab;
  final VoidCallback? onOpenEmergency;
  final VoidCallback? onOpenAI;

  const HomeDashboardTab({
    super.key,
    this.onSelectTab,
    this.onOpenEmergency,
    this.onOpenAI,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Redemption OS Mobile', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18)),
            Text('Redemption City Event Companion', style: TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) => const SermonFeedScreen()));
            },
            icon: const Icon(Icons.radio_button_checked, color: Color(0xFFEF4444)),
            tooltip: 'Live Sermon Feed',
          ),
          IconButton(
            onPressed: onOpenAI,
            icon: const Icon(Icons.psychology_outlined, color: Color(0xFF5B4FE8)),
            tooltip: 'Redemption AI Assistant',
          ),
          IconButton(
            onPressed: onOpenEmergency,
            icon: const Icon(Icons.emergency_outlined, color: Color(0xFFEF4444)),
            tooltip: 'Emergency SOS Dispatch',
          ),
        ],

      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF5B4FE8), Color(0xFF8B82F0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF5B4FE8).withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Welcome to Redemption City', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text('Intelligent Navigation, BitChat Mesh Communication & Emergency Safety', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        onPressed: () => onSelectTab?.call(3),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF5B4FE8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        icon: const Icon(Icons.hub_outlined, size: 16),
                        label: const Text('Open BitChat Mesh⚡', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Ecosystem Quick Access', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0D0D0D))),
            const SizedBox(height: 12),

            // Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.25,
              children: [
                _buildQuickCard(
                  context,
                  icon: Icons.hub_outlined,
                  title: 'BitChat Mesh P2P',
                  subtitle: 'Nostr Relay Communication',
                  color: const Color(0xFF5B4FE8),
                  onTap: () => onSelectTab?.call(3),
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.map_outlined,
                  title: 'Smart Navigation',
                  subtitle: '28 Locations & Maps',
                  color: Colors.purple,
                  onTap: () => onSelectTab?.call(1),
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.storefront_outlined,
                  title: 'Verified Marketplace',
                  subtitle: 'Stores & Delivery',
                  color: Colors.orange,
                  onTap: () => onSelectTab?.call(2),
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.psychology_outlined,
                  title: 'Redemption AI',
                  subtitle: 'Instant AI Guidance',
                  color: Colors.teal,
                  onTap: onOpenAI,
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.qr_code_2,
                  title: 'Child Safety QR',
                  subtitle: 'Family Digital Badges',
                  color: const Color(0xFF10B981),
                  onTap: () => onSelectTab?.call(4),
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.warning_amber_rounded,
                  title: 'Emergency SOS',
                  subtitle: 'Security & Medical',
                  color: const Color(0xFFEF4444),
                  onTap: onOpenEmergency,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickCard(BuildContext context, {required IconData icon, required String title, required String subtitle, required Color color, required VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(color: Colors.grey.shade100, blurRadius: 6, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: color.withValues(alpha: 0.15),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0D0D0D))),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
