import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:crypto/crypto.dart';

const String hgcTag = 'RedemptionCityHGC2024';
const String hgcZoneTag = 'hgc-zone';

const List<String> nostrRelays = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

class BitChatMessage {
  final String id;
  final String pubkey;
  final String senderName;
  final String content;
  final String? zone;
  final DateTime createdAt;
  final bool isOwn;

  BitChatMessage({
    required this.id,
    required this.pubkey,
    required this.senderName,
    required this.content,
    this.zone,
    required this.createdAt,
    this.isOwn = false,
  });

  factory BitChatMessage.fromNostrEvent(Map<String, dynamic> event, String currentPubkey) {
    final List tags = event['tags'] is List ? event['tags'] : [];
    String senderName = '';
    String? zone;

    for (var tag in tags) {
      if (tag is List && tag.isNotEmpty) {
        if (tag[0] == 'name' && tag.length > 1) {
          senderName = tag[1].toString();
        } else if (tag[0] == hgcZoneTag && tag.length > 1) {
          zone = tag[1].toString();
        }
      }
    }

    final pubkeyStr = event['pubkey']?.toString() ?? '';
    if (senderName.isEmpty) {
      senderName = pubkeyStr.length > 6 ? '${pubkeyStr.substring(0, 6)}…' : 'Anonymous';
    }

    final createdAtSec = (event['created_at'] is int)
        ? event['created_at'] as int
        : (int.tryParse(event['created_at']?.toString() ?? '0') ?? 0);

    return BitChatMessage(
      id: event['id']?.toString() ?? '',
      pubkey: pubkeyStr,
      senderName: senderName,
      content: event['content']?.toString() ?? '',
      zone: zone,
      createdAt: DateTime.fromMillisecondsSinceEpoch(createdAtSec * 1000),
      isOwn: pubkeyStr == currentPubkey,
    );
  }
}

class NostrService {
  final String displayName;
  late final String pubkey;
  late final String _privateKeyHex;
  
  final List<WebSocket> _sockets = [];
  final StreamController<BitChatMessage> _messageController = StreamController<BitChatMessage>.broadcast();
  final StreamController<String> _statusController = StreamController<String>.broadcast();

  bool _isDisposed = false;
  final String _subscriptionId = 'sub_${Random().nextInt(999999)}';

  Stream<BitChatMessage> get onMessage => _messageController.stream;
  Stream<String> get onStatus => _statusController.stream;

  NostrService(this.displayName) {
    final randomBytes = List<int>.generate(32, (_) => Random().nextInt(256));
    _privateKeyHex = sha256.convert(randomBytes).toString();
    pubkey = sha256.convert(utf8.encode('pub_$_privateKeyHex')).toString();
  }

  Future<void> connect() async {
    _statusController.add('connecting');
    int connectedCount = 0;

    for (String url in nostrRelays) {
      try {
        final socket = await WebSocket.connect(url).timeout(const Duration(seconds: 5));
        _sockets.add(socket);
        connectedCount++;

        socket.listen(
          (data) {
            _handleRelayMessage(data.toString());
          },
          onError: (_) {},
          onDone: () {},
        );

        final reqFilter = [
          'REQ',
          _subscriptionId,
          {
            'kinds': [1],
            '#t': [hgcTag],
            'limit': 100,
          }
        ];
        socket.add(jsonEncode(reqFilter));
      } catch (_) {
        // Ignore connection errors for offline fallback
      }
    }

    if (connectedCount > 0) {
      _statusController.add('connected');
    } else {
      _statusController.add('error');
    }
  }

  void _handleRelayMessage(String messageText) {
    try {
      final parsed = jsonDecode(messageText);
      if (parsed is List && parsed.length >= 3 && parsed[0] == 'EVENT') {
        final event = parsed[2];
        if (event is Map<String, dynamic>) {
          final msg = BitChatMessage.fromNostrEvent(event, pubkey);
          if (!_isDisposed) {
            _messageController.add(msg);
          }
        }
      }
    } catch (_) {}
  }

  Future<BitChatMessage> publish(String content, [String? zone]) async {
    final nowSec = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final List<List<String>> tags = [
      ['t', hgcTag],
      ['name', displayName],
    ];
    if (zone != null && zone.isNotEmpty && zone != 'All Zones') {
      tags.add([hgcZoneTag, zone]);
    }

    final rawString = '$pubkey:$nowSec:1:${jsonEncode(tags)}:$content';
    final eventId = sha256.convert(utf8.encode(rawString)).toString();

    final event = {
      'id': eventId,
      'pubkey': pubkey,
      'created_at': nowSec,
      'kind': 1,
      'tags': tags,
      'content': content,
      'sig': sha256.convert(utf8.encode('sig_$eventId')).toString(),
    };

    final eventEnvelope = jsonEncode(['EVENT', event]);

    for (var socket in _sockets) {
      try {
        socket.add(eventEnvelope);
      } catch (_) {}
    }

    final localMsg = BitChatMessage(
      id: eventId,
      pubkey: pubkey,
      senderName: displayName,
      content: content,
      zone: zone,
      createdAt: DateTime.fromMillisecondsSinceEpoch(nowSec * 1000),
      isOwn: true,
    );

    return localMsg;
  }

  void destroy() {
    _isDisposed = true;
    for (var socket in _sockets) {
      try {
        socket.close();
      } catch (_) {}
    }
    _sockets.clear();
    _messageController.close();
    _statusController.close();
  }
}
