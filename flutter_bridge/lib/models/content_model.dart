import 'package:json_annotation/json_annotation.dart';

part 'content_model.g.dart';

@JsonSerializable()
class ContentModel {
  final int id;
  final String title;
  final String category;
  final String thumbnailUrl;
  final int durationMinutes;
  final bool premium;
  final List<int> userIds;

  ContentModel({
    required this.id,
    required this.title,
    required this.category,
    required this.thumbnailUrl,
    required this.durationMinutes,
    required this.premium,
    required this.userIds,
  });

  factory ContentModel.fromJson(Map<String, dynamic> json) =>
      _$ContentModelFromJson(json);

  Map<String, dynamic> toJson() => _$ContentModelToJson(this);
}
