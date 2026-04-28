import 'package:json_annotation/json_annotation.dart';

part 'dashboard_stats_model.g.dart';

@JsonSerializable()
class DashboardStatsModel {
  final int totalSubscriptions;
  final int activeSubscriptions;
  final int totalContents;
  final int premiumContents;
  final int totalCategories;

  DashboardStatsModel({
    required this.totalSubscriptions,
    required this.activeSubscriptions,
    required this.totalContents,
    required this.premiumContents,
    required this.totalCategories,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) =>
      _$DashboardStatsModelFromJson(json);

  Map<String, dynamic> toJson() => _$DashboardStatsModelToJson(this);
}
