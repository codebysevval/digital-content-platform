import 'package:json_annotation/json_annotation.dart';

part 'subscription_model.g.dart';

@JsonSerializable()
class SubscriptionModel {
  final int id;
  final String planName;
  final double price;
  final String currency;
  final String billingCycle;
  final String startDate;
  final String endDate;
  final bool active;
  final int userId;

  SubscriptionModel({
    required this.id,
    required this.planName,
    required this.price,
    required this.currency,
    required this.billingCycle,
    required this.startDate,
    required this.endDate,
    required this.active,
    required this.userId,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) =>
      _$SubscriptionModelFromJson(json);

  Map<String, dynamic> toJson() => _$SubscriptionModelToJson(this);
}
