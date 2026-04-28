import 'package:dio/dio.dart';

import '../models/auth_response_model.dart';
import '../models/content_model.dart';
import '../models/login_request_model.dart';
import '../models/register_request_model.dart';
import '../models/user_dashboard_model.dart';

class ApiService {
  ApiService({required String baseUrl})
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            headers: {'Content-Type': 'application/json'},
          ),
        );

  final Dio _dio;
  String? _jwtToken;

  /// Login ekranındaki kullanıcı doğrulamasını backend'e gönderir.
  Future<AuthResponseModel> login(LoginRequestModel request) async {
    final response = await _dio.post('/api/auth/login', data: request.toJson());
    final auth = AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
    _jwtToken = auth.token;
    return auth;
  }

  /// Register ekranındaki form verisini backend'e gönderir.
  Future<AuthResponseModel> register(RegisterRequestModel request) async {
    final response =
        await _dio.post('/api/auth/register', data: request.toJson());
    final auth = AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
    _jwtToken = auth.token;
    return auth;
  }

  /// Dashboard ekranındaki profil, istatistik ve kart listesini tek çağrıda çeker.
  Future<UserDashboardModel> getMyDashboard() async {
    final response = await _dio.get(
      '/api/dashboard/me',
      options: Options(headers: _authorizationHeader()),
    );
    return UserDashboardModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// İçerik kartlarını public endpoint üzerinden listeler.
  Future<List<ContentModel>> getContents() async {
    final response = await _dio.get('/api/contents');
    final payload = response.data as List<dynamic>;
    return payload
        .map((item) => ContentModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  /// Yönetici panelindeki içerik ekleme aksiyonunu çalıştırır.
  Future<ContentModel> createContent({
    required String title,
    required String category,
    required String thumbnailUrl,
    required int durationMinutes,
    required bool premium,
  }) async {
    final response = await _dio.post(
      '/api/contents',
      options: Options(headers: _authorizationHeader()),
      data: {
        'title': title,
        'category': category,
        'thumbnailUrl': thumbnailUrl,
        'durationMinutes': durationMinutes,
        'premium': premium,
      },
    );
    return ContentModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Yönetici panelindeki içerik silme aksiyonunu çalıştırır.
  Future<void> deleteContent(int contentId) async {
    await _dio.delete(
      '/api/contents/$contentId',
      options: Options(headers: _authorizationHeader()),
    );
  }

  Map<String, String> _authorizationHeader() {
    if (_jwtToken == null || _jwtToken!.isEmpty) {
      throw StateError('JWT token yok. Önce login/register çağrılmalı.');
    }
    return {'Authorization': 'Bearer $_jwtToken'};
  }
}
