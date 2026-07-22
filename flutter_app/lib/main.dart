import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RedemptionOSApp());
}

class RedemptionOSApp extends StatelessWidget {
  const RedemptionOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Redemption OS Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF5B4FE8),
          primary: const Color(0xFF5B4FE8),
        ),
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
