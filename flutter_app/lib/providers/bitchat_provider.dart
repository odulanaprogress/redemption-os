import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/nostr_service.dart';

enum BitChatStatus { idle, connecting, connected, error }

class BitChatProvider extends ChangeNotifier {
  List<BitChatMessage> _messages = [];
  BitChatStatus _status = BitChatStatus.idle;
  String? _error;
  NostrService? _service;

  List<BitChatMessage> get messages => List.unmodifiable(_messages);
  BitChatStatus get status => _status;
  String? get error => _error;
  NostrService? get service => _service;

  void init(String displayName) {
    if (_service != null) return;

    _status = BitChatStatus.connecting;
    _error = null;
    notifyListeners();

    _service = NostrService(displayName);
    
    _service!.onStatus.listen((statusStr) {
      if (statusStr == 'connected') {
        _status = BitChatStatus.connected;
      } else if (statusStr == 'connecting') {
        _status = BitChatStatus.connecting;
      } else if (statusStr == 'error') {
        _status = BitChatStatus.error;
        _error = 'Relay unreachable or network offline';
      }
      notifyListeners();
    });

    _service!.onMessage.listen((msg) {
      _addAndDedupe(msg);
    });

    _service!.connect();
  }

  Future<void> send(String content, [String? zone]) async {
    if (_service == null) return;
    try {
      final msg = await _service!.publish(content, zone);
      _addAndDedupe(msg);
    } catch (e) {
      _error = 'Failed to publish message';
      notifyListeners();
    }
  }

  void _addAndDedupe(BitChatMessage msg) {
    final existingIndex = _messages.indexWhere((m) => m.id == msg.id);
    if (existingIndex == -1) {
      _messages.add(msg);
      _messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      if (_messages.length > 200) {
        _messages = _messages.sublist(_messages.length - 200);
      }
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void destroy() {
    _service?.destroy();
    _service = null;
    _messages.clear();
    _status = BitChatStatus.idle;
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    destroy();
    super.dispose();
  }
}
