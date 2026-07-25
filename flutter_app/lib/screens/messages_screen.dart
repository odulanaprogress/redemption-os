import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/bitchat_provider.dart';
import '../services/nostr_service.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _msgController = TextEditingController();
  final TextEditingController _dmController = TextEditingController();
  String _selectedZone = 'All Zones';

  final List<String> _zones = [
    'All Zones',
    'Main Sanctuary',
    'Hall B',
    'Overflow Arena',
    'Prayer Garden',
  ];

  final List<Map<String, String>> _broadcasts = [
    {
      'title': 'Holy Ghost Night Main Service',
      'type': 'Operational',
      'zone': 'Main Sanctuary',
      'message': 'Main service starts at 6:00 PM in the 3km Main Arena.',
      'time': '10 min ago',
      'sender': 'Admin Broadcast Command',
    },
    {
      'title': 'Parking Shuttle Transfer Notice',
      'type': 'Info',
      'zone': 'Car Park C',
      'message': 'Free shuttle buses operating every 5 minutes from Car Park C.',
      'time': '25 min ago',
      'sender': 'Logistics Command',
    },
    {
      'title': 'Weather & Security Advisory',
      'type': 'Alert',
      'zone': 'All Zones',
      'message': 'Light shower expected at 8:00 PM. Indoor canopy seating open.',
      'time': '1 hour ago',
      'sender': 'Security Command',
    },
  ];

  final List<Map<String, String>> _directMessages = [
    {
      'sender': 'Brother Dave (Family Badge #082)',
      'text': 'Praise God! I am seated near Section 4 in the Main Sanctuary.',
      'time': '10:14 AM',
      'isMe': 'false',
    },
    {
      'sender': 'You',
      'text': 'Amen! Save a seat for me and the kids.',
      'time': '10:16 AM',
      'isMe': 'true',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BitChatProvider>().init('Attendee Mobile');
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _msgController.dispose();
    _dmController.dispose();
    super.dispose();
  }

  void _sendBitChatMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;
    context.read<BitChatProvider>().send(text, _selectedZone);
    _msgController.clear();
  }

  void _sendDirectMessage() {
    final text = _dmController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _directMessages.add({
        'sender': 'You',
        'text': text,
        'time': 'Just now',
        'isMe': 'true',
      });
      _dmController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text(
          'Communication Center',
          style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF5B4FE8),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF5B4FE8),
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.podcasts), text: 'Broadcasts'),
            Tab(icon: Icon(Icons.forum_outlined), text: 'Zone Channels'),
            Tab(icon: Icon(Icons.hub_outlined), text: 'BitChat Mesh⚡'),
            Tab(icon: Icon(Icons.mark_chat_read_outlined), text: 'Direct Messages'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // ── TAB 1: OFFICIAL BROADCASTS ────────────────────────────────────
          _buildBroadcastsTab(),

          // ── TAB 2: ZONE CHANNELS ──────────────────────────────────────────
          _buildChannelsTab(),

          // ── TAB 3: BITCHAT NOSTR P2P MESH ─────────────────────────────────
          _buildBitChatMeshTab(),

          // ── TAB 4: DIRECT MESSAGES ────────────────────────────────────────
          _buildDirectMessagesTab(),
        ],
      ),
    );
  }

  Widget _buildBroadcastsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _broadcasts.length,
      itemBuilder: (context, index) {
        final b = _broadcasts[index];
        final type = b['type'];
        Color typeColor = const Color(0xFF5B4FE8);
        Color typeBg = const Color(0xFFEDE9FE);
        if (type == 'Alert') {
          typeColor = Colors.amber.shade800;
          typeBg = Colors.amber.shade50;
        } else if (type == 'Info') {
          typeColor = const Color(0xFF10B981);
          typeBg = const Color(0xFFD1FAE5);
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: typeBg, borderRadius: BorderRadius.circular(12)),
                    child: Text(type!, style: TextStyle(color: typeColor, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                  Text(b['time']!, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
              const SizedBox(height: 10),
              Text(b['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0D0D0D))),
              const SizedBox(height: 4),
              Text(b['message']!, style: const TextStyle(fontSize: 13, color: Color(0xFF4B5563))),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(b['zone']!, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                  Text('From: ${b['sender']}', style: const TextStyle(fontSize: 10, color: Color(0xFF5B4FE8), fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildChannelsTab() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          color: Colors.white,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _zones.map((z) {
                final isSelected = _selectedZone == z;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(z),
                    selected: isSelected,
                    selectedColor: const Color(0xFFEDE9FE),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF5B4FE8) : Colors.black87,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (val) => setState(() => _selectedZone = z),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildChannelMessageCard('Security Team', 'Car Park C shuttle is operational.', '10:05 AM'),
              _buildChannelMessageCard('Sanctuary Ushering', 'Canopy seats open near Gate 2.', '10:12 AM'),
              _buildChannelMessageCard('Technical Ops', 'Audio stream synchronized across all overflow arenas.', '10:20 AM'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChannelMessageCard(String sender, String text, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(sender, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF5B4FE8))),
              Text(time, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 6),
          Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF0D0D0D))),
        ],
      ),
    );
  }

  Widget _buildBitChatMeshTab() {
    return Consumer<BitChatProvider>(
      builder: (context, bitchat, child) {
        final status = bitchat.status;
        String statusLabel = 'Connecting Nostr Relays...';
        Color statusColor = Colors.amber;
        IconData statusIcon = Icons.wifi_protected_setup;

        if (status == BitChatStatus.connected) {
          statusLabel = 'Connected to Decentralized Nostr Mesh';
          statusColor = const Color(0xFF10B981);
          statusIcon = Icons.wifi;
        } else if (status == BitChatStatus.error) {
          statusLabel = 'Relay connection offline / fallback mesh';
          statusColor = Colors.red;
          statusIcon = Icons.wifi_off;
        }

        final messages = bitchat.messages;

        return Column(
          children: [
            // Status Header Pill
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: statusColor.withValues(alpha: 0.1),
              child: Row(
                children: [
                  Icon(statusIcon, color: statusColor, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      statusLabel,
                      style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEDE9FE),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text('HGC 2024 Mesh', style: TextStyle(color: Color(0xFF5B4FE8), fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

            // Message Stream
            Expanded(
              child: messages.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.hub_outlined, size: 48, color: Color(0xFF5B4FE8)),
                          SizedBox(height: 12),
                          Text('Decentralized BitChat Mesh Active', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          SizedBox(height: 4),
                          Text('Messages broadcast via Nostr WebSocket relays & local P2P', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final BitChatMessage msg = messages[index];
                        final isOwn = msg.isOwn;

                        return Align(
                          alignment: isOwn ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                            decoration: BoxDecoration(
                              color: isOwn ? const Color(0xFF5B4FE8) : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: isOwn ? null : Border.all(color: Colors.grey.shade200),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      isOwn ? 'You' : msg.senderName,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                        color: isOwn ? Colors.white70 : const Color(0xFF5B4FE8),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    const Text('⚡', style: TextStyle(fontSize: 10)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  msg.content,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isOwn ? Colors.white : const Color(0xFF0D0D0D),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),

            // Input Control
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(12),
              child: SafeArea(
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _msgController,
                        decoration: InputDecoration(
                          hintText: 'Broadcast on BitChat Mesh...',
                          filled: true,
                          fillColor: const Color(0xFFF8F9FF),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        onSubmitted: (_) => _sendBitChatMessage(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: _sendBitChatMessage,
                      icon: const Icon(Icons.send),
                      color: const Color(0xFF5B4FE8),
                      style: IconButton.styleFrom(backgroundColor: const Color(0xFFEDE9FE)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDirectMessagesTab() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _directMessages.length,
            itemBuilder: (context, index) {
              final dm = _directMessages[index];
              final isMe = dm['isMe'] == 'true';

              return Align(
                alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                  decoration: BoxDecoration(
                    color: isMe ? const Color(0xFF5B4FE8) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: isMe ? null : Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        dm['sender']!,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                          color: isMe ? Colors.white70 : const Color(0xFF5B4FE8),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        dm['text']!,
                        style: TextStyle(fontSize: 14, color: isMe ? Colors.white : const Color(0xFF0D0D0D)),
                      ),
                      const SizedBox(height: 4),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: Text(
                          dm['time']!,
                          style: TextStyle(fontSize: 9, color: isMe ? Colors.white60 : Colors.grey),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Container(
          color: Colors.white,
          padding: const EdgeInsets.all(12),
          child: SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _dmController,
                    decoration: InputDecoration(
                      hintText: 'Type direct message...',
                      filled: true,
                      fillColor: const Color(0xFFF8F9FF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: (_) => _sendDirectMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _sendDirectMessage,
                  icon: const Icon(Icons.send),
                  color: const Color(0xFF5B4FE8),
                  style: IconButton.styleFrom(backgroundColor: const Color(0xFFEDE9FE)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
