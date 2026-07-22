import 'package:flutter/material.dart';
import 'navigation_screen.dart';
import 'messages_screen.dart';
import 'qr_identity_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomeDashboardTab(),
    const NavigationScreen(),
    const MessagesScreen(),
    const QRIdentityScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
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
          BottomNavigationBarItem(icon: Icon(Icons.message_outlined), label: 'Messages'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code_2), label: 'QR Safety'),
        ],
      ),
    );
  }
}

class HomeDashboardTab extends StatelessWidget {
  const HomeDashboardTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Redemption OS', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18)),
            Text('Redemption City Mobile App', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none, color: Color(0xFF0D0D0D)),
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
                  BoxShadow(color: const Color(0xFF5B4FE8).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Welcome to Redemption City', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 6),
                  Text('Intelligent Navigation, Child Safety & Real-time Communications Engine', style: TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Quick Access', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0D0D0D))),
            const SizedBox(height: 12),

            // Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
              children: [
                _buildQuickCard(
                  context,
                  icon: Icons.map,
                  title: 'Smart Navigation',
                  subtitle: '28 Locations & Satellite',
                  color: Colors.purple,
                  onTap: () {
                    final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                    homeState?.setState(() => homeState._currentIndex = 1);
                  },
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.chat_bubble_outline,
                  title: 'Communications',
                  subtitle: 'Live Channel Stream',
                  color: Colors.blue,
                  onTap: () {
                    final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                    homeState?.setState(() => homeState._currentIndex = 2);
                  },
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.qr_code,
                  title: 'Child Safety QR',
                  subtitle: 'Family Badges',
                  color: const Color(0xFF10B981),
                  onTap: () {
                    final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                    homeState?.setState(() => homeState._currentIndex = 3);
                  },
                ),
                _buildQuickCard(
                  context,
                  icon: Icons.warning_amber_rounded,
                  title: 'Emergency SOS',
                  subtitle: 'Security Dispatch',
                  color: Colors.amber,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Emergency Panic Dispatch active — location shared with safety team.')),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickCard(BuildContext context, {required IconData icon, required String title, required String subtitle, required Color color, required VoidCallback onTap}) {
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
              backgroundColor: color.withOpacity(0.15),
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
