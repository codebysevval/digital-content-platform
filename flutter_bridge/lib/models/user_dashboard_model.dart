import 'package:json_annotation/json_annotation.dart';

import 'content_model.dart';
import 'dashboard_stats_model.dart';
import 'subscription_model.dart';
import 'user_session_model.dart';

part 'user_dashboard_model.g.dart';

@JsonSerializable()
class UserDashboardModel {
  final UserSessionModel profile;
  final DashboardStatsModel stats;
  final List<String> categories;
  final List<SubscriptionModel> subscriptions;
  final List<ContentModel> contents;

  UserDashboardModel({
    required this.profile,
    required this.stats,
    required this.categories,
    required this.subscriptions,
    required this.contents,
  });

  factory UserDashboardModel.fromJson(Map<String, dynamic> json) =>
      _$UserDashboardModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserDashboardModelToJson(this);
}
