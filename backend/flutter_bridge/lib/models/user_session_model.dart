import 'package:json_annotation/json_annotation.dart';

part 'user_session_model.g.dart';

@JsonSerializable()
class UserSessionModel {
  final int id;
  final String username;
  final String email;
  final String fullName;
  final String role;

  UserSessionModel({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    required this.role,
  });

  factory UserSessionModel.fromJson(Map<String, dynamic> json) =>
      _$UserSessionModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserSessionModelToJson(this);
}
