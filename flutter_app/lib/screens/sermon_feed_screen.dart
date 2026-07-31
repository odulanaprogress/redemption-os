import 'package:flutter/material.dart';

class SermonFeedScreen extends StatefulWidget {
  const SermonFeedScreen({Key? key}) : super(key: key);

  @override
  State<SermonFeedScreen> createState() => _SermonFeedScreenState();
}

class _SermonFeedScreenState extends State<SermonFeedScreen> {
  String selectedLanguage = 'English';
  final List<String> languages = [
    'English',
    'Èdè Yorùbá',
    'Français',
    'Harshen Hausa',
    'Naija Pidgin',
    'Español'
  ];

  final List<Map<String, dynamic>> _mockChunks = [
    {
      'timestamp': '10:02',
      'speaker': 'Pastor Elijah',
      'text': 'Welcome everyone to today\'s live ministration on Divine Grace and Power.',
      'isVerse': false,
    },
    {
      'timestamp': '10:05',
      'speaker': 'Pastor Elijah',
      'reference': 'John 3:16',
      'text': '"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."',
      'isVerse': true,
    },
    {
      'timestamp': '10:12',
      'speaker': 'Pastor Elijah',
      'text': 'Surrender your plans to God, and witness divine alignment in every area of your life.',
      'isVerse': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Live Sermon Feed',
              style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              'On-Device Speech-to-Text • Offline Ready',
              style: TextStyle(color: Colors.grey, fontSize: 11),
            ),
          ],
        ),
        actions: [
          DropdownButton<String>(
            value: selectedLanguage,
            underline: const SizedBox(),
            icon: const Icon(Icons.language, color: Color(0xFF5B4FE8)),
            onChanged: (String? newValue) {
              if (newValue != null) {
                setState(() {
                  selectedLanguage = newValue;
                });
              }
            },
            items: languages.map<DropdownMenuItem<String>>((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              );
            }).toList(),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Column(
        children: [
          // 2G/3G Low Bandwidth Status Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFFE6F4EA),
            child: Row(
              children: const [
                Icon(Icons.network_check, color: Color(0xFF059669), size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '2G/3G Ultra-Low Bandwidth Mode (~0.02 KB/s)',
                    style: TextStyle(color: Color(0xFF059669), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                Text(
                  '0 MB Used',
                  style: TextStyle(color: Color(0xFF059669), fontSize: 11, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
          // Chunks List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _mockChunks.length,
              itemBuilder: (context, index) {
                final chunk = _mockChunks[index];
                final isVerse = chunk['isVerse'] == true;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: isVerse ? Colors.emerald.withOpacity(0.4) : Colors.grey.withOpacity(0.2),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.radio_button_checked, color: Colors.red, size: 14),
                                const SizedBox(width: 6),
                                Text(
                                  chunk['speaker'] ?? 'Minister',
                                  style: const TextStyle(
                                    color: Color(0xFF5B4FE8),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              chunk['timestamp'],
                              style: const TextStyle(color: Colors.grey, fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          chunk['text'],
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.4,
                            fontStyle: isVerse ? FontStyle.italic : FontStyle.normal,
                            fontWeight: isVerse ? FontWeight.bold : FontWeight.normal,
                            color: Colors.black87,
                          ),
                        ),
                        if (isVerse && chunk['reference'] != null) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.book, size: 14, color: Color(0xFF059669)),
                              const SizedBox(width: 4),
                              Text(
                                chunk['reference'],
                                style: const TextStyle(
                                  color: Color(0xFF059669),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
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
