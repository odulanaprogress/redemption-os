import 'package:flutter/material.dart';

class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({super.key});

  @override
  State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'role': 'assistant',
      'content': 'Hello! I am Redemption AI. I can assist with navigation, service times, emergency locations, and child safety passes. How can I help you today?',
    }
  ];
  bool _isTyping = false;

  final List<String> _quickQueries = [
    'Where is Hall B?',
    'Nearest medical center?',
    'Child Safety Pass setup',
    'Service schedule today',
  ];

  void _sendMessage(String query) async {
    final text = query.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _controller.clear();
      _isTyping = true;
    });

    await Future.delayed(const Duration(milliseconds: 900));

    String reply = 'I am here to help! For immediate directions or assistance, check the Smart Navigation tab or contact the Security Command center.';
    final lower = text.toLowerCase();

    if (lower.contains('hall b') || lower.contains('navigation')) {
      reply = 'Hall B is located 1.2km North-East from the Main Arena Gate 3. Follow the purple signs or use the Smart Navigation map.';
    } else if (lower.contains('medical') || lower.contains('doctor') || lower.contains('emergency')) {
      reply = 'The nearest Camp Medical Center is at Arena Gate 1 & 4. For emergency dispatch, tap Emergency SOS on the home tab.';
    } else if (lower.contains('child') || lower.contains('pass') || lower.contains('qr')) {
      reply = 'To register your child, visit the QR Safety tab. Generate a family badge and show it to any security checkpoint.';
    } else if (lower.contains('schedule') || lower.contains('time') || lower.contains('service')) {
      reply = 'Holy Ghost Congress Evening Session begins at 6:00 PM in the 3km Main Auditorium. Gates open at 4:30 PM.';
    }

    if (mounted) {
      setState(() {
        _messages.add({'role': 'assistant', 'content': reply});
        _isTyping = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        title: const Row(
          children: [
            CircleAvatar(
              backgroundColor: Color(0xFFEDE9FE),
              radius: 16,
              child: Icon(Icons.psychology, color: Color(0xFF5B4FE8), size: 20),
            ),
            SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Redemption AI Assistant', style: TextStyle(color: Color(0xFF0D0D0D), fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Instant Camp Guidance', style: TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF0D0D0D)),
      ),
      body: Column(
        children: [
          // Quick query chips
          Container(
            height: 50,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _quickQueries.length,
              itemBuilder: (context, index) {
                final query = _quickQueries[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ActionChip(
                    label: Text(query, style: const TextStyle(fontSize: 12, color: Color(0xFF5B4FE8))),
                    backgroundColor: const Color(0xFFEDE9FE),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide.none),
                    onPressed: () => _sendMessage(query),
                  ),
                );
              },
            ),
          ),

          const Divider(height: 1),

          // Message list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF5B4FE8)),
                          ),
                          SizedBox(width: 8),
                          Text('Redemption AI is thinking...', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                  );
                }

                final msg = _messages[index];
                final isUser = msg['role'] == 'user';

                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF5B4FE8) : Colors.white,
                      border: isUser ? null : Border.all(color: Colors.grey.shade200),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(color: Colors.grey.shade100, blurRadius: 4, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Text(
                      msg['content']!,
                      style: TextStyle(
                        fontSize: 14,
                        color: isUser ? Colors.white : const Color(0xFF0D0D0D),
                        height: 1.4,
                      ),
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
                      controller: _controller,
                      decoration: InputDecoration(
                        hintText: 'Ask Redemption AI...',
                        filled: true,
                        fillColor: const Color(0xFFF8F9FF),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _sendMessage(_controller.text),
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
