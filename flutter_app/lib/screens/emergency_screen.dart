import 'package:flutter/material.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  bool _sosActive = false;
  String _selectedEmergencyType = 'Medical Emergency';

  final List<Map<String, dynamic>> _incidentTypes = [
    {'type': 'Medical Emergency', 'icon': Icons.medical_services_outlined, 'color': Color(0xFFEF4444)},
    {'type': 'Security Incident', 'icon': Icons.security_outlined, 'color': Color(0xFFF59E0B)},
    {'type': 'Fire Alert', 'icon': Icons.local_fire_department_outlined, 'color': Color(0xFFDC2626)},
    {'type': 'Lost Child Alert', 'icon': Icons.child_care_outlined, 'color': Color(0xFF5B4FE8)},
  ];

  void _triggerSOS() {
    setState(() {
      _sosActive = true;
    });
  }

  void _cancelSOS() {
    setState(() {
      _sosActive = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text(
          'Emergency & SOS Dispatch',
          style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF0D0D0D)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!_sosActive) ...[
              // SOS Big Action Circle
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24.0),
                  child: GestureDetector(
                    onTap: _triggerSOS,
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFEF4444).withValues(alpha: 0.4),
                            blurRadius: 24,
                            spreadRadius: 8,
                          ),
                        ],
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.warning_amber_rounded, size: 54, color: Colors.white),
                          SizedBox(height: 8),
                          Text(
                            'SOS DISPATCH',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1),
                          ),
                          Text(
                            'Tap to Alert Security',
                            style: TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),
              const Text('Select Emergency Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 12),

              Column(
                children: _incidentTypes.map((item) {
                  final isSelected = _selectedEmergencyType == item['type'];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? (item['color'] as Color).withValues(alpha: 0.1) : Colors.white,
                      border: Border.all(
                        color: isSelected ? (item['color'] as Color) : Colors.grey.shade200,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ListTile(
                      onTap: () => setState(() => _selectedEmergencyType = item['type']),
                      leading: CircleAvatar(
                        backgroundColor: (item['color'] as Color).withValues(alpha: 0.15),
                        child: Icon(item['icon'] as IconData, color: item['color'] as Color),
                      ),
                      title: Text(item['type'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      trailing: isSelected ? Icon(Icons.check_circle, color: item['color'] as Color) : null,
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 24),
              const Text('Direct Emergency Hotlines', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: const Column(
                  children: [
                    _HotlineRow(title: 'Redemption Security Command', phone: '+234 800 911 0001', icon: Icons.shield_outlined, color: Color(0xFF5B4FE8)),
                    Divider(height: 24),
                    _HotlineRow(title: 'Camp Medical Response Center', phone: '+234 800 911 0002', icon: Icons.medical_information_outlined, color: Color(0xFFEF4444)),
                    Divider(height: 24),
                    _HotlineRow(title: 'Fire & Rescue Service', phone: '+234 800 911 0003', icon: Icons.fire_extinguisher_outlined, color: Color(0xFFF59E0B)),
                  ],
                ),
              ),
            ] else ...[
              // SOS ACTIVE DISPATCH CARD
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  border: Border.all(color: const Color(0xFFFCA5A5)),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.emergency, size: 64, color: Color(0xFFEF4444)),
                    const SizedBox(height: 12),
                    const Text(
                      'EMERGENCY ALERT ACTIVE',
                      style: TextStyle(color: Color(0xFF991B1B), fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Dispatching Security & Medical teams to your location.\nType: $_selectedEmergencyType',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFF7F1D1D), fontSize: 13),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.my_location, color: Color(0xFFEF4444), size: 18),
                          SizedBox(width: 8),
                          Text('GPS: 6.8431° N, 3.4211° E (Main Arena)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _cancelSOS,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFFEF4444),
                        side: const BorderSide(color: Color(0xFFEF4444)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: const Icon(Icons.cancel_outlined),
                      label: const Text('CANCEL EMERGENCY ALERT', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _HotlineRow extends StatelessWidget {
  final String title;
  final String phone;
  final IconData icon;
  final Color color;

  const _HotlineRow({required this.title, required this.phone, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.15),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              Text(phone, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ),
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.phone),
          color: color,
        ),
      ],
    );
  }
}
