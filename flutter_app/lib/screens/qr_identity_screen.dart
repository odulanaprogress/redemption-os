import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class QRIdentityScreen extends StatefulWidget {
  const QRIdentityScreen({super.key});

  @override
  State<QRIdentityScreen> createState() => _QRIdentityScreenState();
}

class _QRIdentityScreenState extends State<QRIdentityScreen> {
  final List<Map<String, String>> _registeredChildren = [
    {
      'id': 'child-001',
      'name': 'Timmy Okonkwo',
      'zone': 'Children Zone A',
      'contactName': 'David Okonkwo',
      'contactPhone': '+234 800 111 2233',
      'allergies': 'Peanuts, Latex',
    },
    {
      'id': 'child-002',
      'name': 'Grace Okonkwo',
      'zone': 'Children Zone B',
      'contactName': 'David Okonkwo',
      'contactPhone': '+234 800 111 2233',
      'allergies': 'None',
    },
  ];

  Map<String, String>? _selectedChild;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Child Safety QR System', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF0D0D0D)),
      ),
      body: _selectedChild != null ? _buildQRCardView(_selectedChild!) : _buildChildrenList(),
    );
  }

  Widget _buildChildrenList() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Parent & Family QR Badges', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Generate digital QR badges for your children at Redemption City.', style: TextStyle(fontSize: 12, color: Colors.grey)),
        const SizedBox(height: 16),
        ..._registeredChildren.map((child) {
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.blue.shade100,
                child: const Icon(Icons.child_care, color: Colors.blue),
              ),
              title: Text(child['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(child['zone']!, style: const TextStyle(fontSize: 12)),
              trailing: ElevatedButton.icon(
                onPressed: () => setState(() => _selectedChild = child),
                icon: const Icon(Icons.qr_code, size: 16),
                label: const Text('View Badge'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildQRCardView(Map<String, String> child) {
    final qrData = '{"familyMemberId":"${child['id']}","name":"${child['name']}"}';

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: Colors.emerald.shade50, borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.verified, size: 16, color: Colors.emerald),
                      SizedBox(width: 6),
                      Text('Official Redemption City Tag', style: TextStyle(color: Colors.emerald, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(child['name']!, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                Text(child['zone']!, style: const TextStyle(color: Colors.grey, fontSize: 14)),
                const SizedBox(height: 20),

                // QR Code
                QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 200.0,
                  backgroundColor: Colors.white,
                ),

                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFFF8F9FF), borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.phone, size: 16, color: Color(0xFF5B4FE8)),
                          const SizedBox(width: 8),
                          Text('Contact: ${child['contactName']} (${child['contactPhone']})', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      if (child['allergies'] != 'None') ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.warning_amber, size: 16, color: Colors.amber),
                            const SizedBox(width: 8),
                            Text('Allergies: ${child['allergies']}', style: const TextStyle(fontSize: 12, color: Colors.amber)),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                OutlinedButton(
                  onPressed: () => setState(() => _selectedChild = null),
                  child: const Text('Back to Family List'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
