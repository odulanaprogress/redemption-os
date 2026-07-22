import 'package:flutter/material.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, String>> _messages = [
    {'sender': 'Admin Broadcast', 'text': 'Main service begins in 15 minutes at Main Auditorium 3km Arena.', 'time': '10:00 AM', 'isBroadcast': 'true'},
    {'sender': 'Security Team', 'text': 'Car Park C is now open for shuttle transfers.', 'time': '10:05 AM', 'isBroadcast': 'true'},
    {'sender': 'Attendee Dave', 'text': 'Praise God! The atmosphere is electric here in Redemption City!', 'time': '10:12 AM', 'isBroadcast': 'false'},
  ];

  void _sendMessage() {
    if (_msgController.text.trim().isEmpty) return;
    setState(() {
      _messages.add({
        'sender': 'You',
        'text': _msgController.text.trim(),
        'time': 'Just now',
        'isBroadcast': 'false',
      });
      _msgController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Text('Communication Center', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF0D0D0D)),
      ),
      body: Column(
        children: [
          // Banner
          Container(
            width: double.infinity,
            color: const Color(0xFFEDE9FE),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: const Row(
              children: [
                Icon(Icons.podcasts, color: Color(0xFF5B4FE8)),
                SizedBox(width: 10),
                Expanded(child: Text('Live Broadcasts & Real-time Channel Stream', style: TextStyle(color: Color(0xFF5B4FE8), fontWeight: FontWeight.bold, fontSize: 12))),
              ],
            ),
          ),

          // Message list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isBroadcast = msg['isBroadcast'] == 'true';
                final isMe = msg['sender'] == 'You';

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isBroadcast
                          ? const Color(0xFFFFFBEB)
                          : isMe
                              ? const Color(0xFF5B4FE8)
                              : Colors.white,
                      border: Border.all(
                        color: isBroadcast ? const Color(0xFFFCD34D) : isMe ? Colors.transparent : const Color(0xFFE5E7EB),
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              msg['sender']!,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                color: isMe
                                    ? Colors.white
                                    : isBroadcast
                                        ? const Color(0xFFB45309)
                                        : Colors.black87,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              msg['time']!,
                              style: TextStyle(fontSize: 10, color: isMe ? Colors.white70 : Colors.grey),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          msg['text']!,
                          style: TextStyle(fontSize: 14, color: isMe ? Colors.white : const Color(0xFF0D0D0D)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Input field
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
                        hintText: 'Type a message...',
                        filled: true,
                        fillColor: const Color(0xFFF8F9FF),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _sendMessage,
                    icon: const Icon(Icons.send),
                    color: const Color(0xFF5B4FE8),
                    style: IconButton.styleFrom(backgroundColor: const Color(0xFFEDE9FE)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
