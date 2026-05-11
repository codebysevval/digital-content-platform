package com.sochen.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Pure-display formatting helpers shared by services that produce localized
 * Turkish strings for the frontend. All public helpers are null-safe; passing
 * null returns a sensible empty/dash placeholder rather than throwing, so
 * services can keep call sites concise.
 */
public final class DisplayFormatter {

    public static final Locale TR = Locale.forLanguageTag("tr-TR");

    private static final DecimalFormatSymbols TR_SYMBOLS = new DecimalFormatSymbols(TR);

    static {
        TR_SYMBOLS.setDecimalSeparator(',');
        TR_SYMBOLS.setGroupingSeparator('.');
    }

    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy", TR);
    private static final DateTimeFormatter LONG_DATE = DateTimeFormatter.ofPattern("d MMMM yyyy", TR);

    private DisplayFormatter() {
    }

    /**
     * "₺85.420" — integer Turkish lira, dot grouping separator, no decimals.
     */
    public static String formatCurrency(long amount) {
        DecimalFormat df = new DecimalFormat("#,##0", TR_SYMBOLS);
        return "₺" + df.format(amount);
    }

    public static String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "₺0";
        }
        return formatCurrency(amount.setScale(0, RoundingMode.HALF_UP).longValueExact());
    }

    /**
     * "₺41,07" — Turkish lira with two decimal places (used for ARPU).
     */
    public static String formatCurrencyDecimal(BigDecimal amount) {
        if (amount == null) {
            return "₺0,00";
        }
        DecimalFormat df = new DecimalFormat("#,##0.00", TR_SYMBOLS);
        return "₺" + df.format(amount);
    }

    /**
     * "%8,9" — single decimal, comma separator.
     */
    public static String formatPercentage(double value) {
        DecimalFormat df = new DecimalFormat("0.0", TR_SYMBOLS);
        return "%" + df.format(value);
    }

    public static String formatPercentageInt(double value) {
        return "%" + (long) Math.round(value);
    }

    /**
     * "12,4B" (B = bin = thousand) / "1,2M" (M = milyon).
     */
    public static String formatAbbreviatedCount(long count) {
        if (count >= 1_000_000) {
            double v = count / 1_000_000.0;
            return formatOneDecimal(v) + "M";
        }
        if (count >= 1_000) {
            double v = count / 1_000.0;
            return formatOneDecimal(v) + "B";
        }
        return Long.toString(count);
    }

    /**
     * Same range thresholds as {@link #formatAbbreviatedCount(long)} but uses
     * the dot-decimal separator the frontend expects in the FollowedCreator
     * sidebar projection ("12.5B").
     */
    public static String formatFollowedCreatorCount(long count) {
        if (count >= 1_000_000) {
            double v = count / 1_000_000.0;
            return formatOneDecimalDot(v) + "M";
        }
        if (count >= 1_000) {
            double v = count / 1_000.0;
            return formatOneDecimalDot(v) + "B";
        }
        return Long.toString(count);
    }

    /**
     * "1.247" — Turkish-grouped integer string (no currency prefix).
     */
    public static String formatThousands(long value) {
        DecimalFormat df = new DecimalFormat("#,##0", TR_SYMBOLS);
        return df.format(value);
    }

    /**
     * "19 Mayıs 2026" — long date in Turkish locale.
     */
    public static String formatTurkishLongDate(LocalDate date) {
        return date == null ? "" : LONG_DATE.format(date);
    }

    /**
     * "19.04.2026" — short numeric date.
     */
    public static String formatDisplayDate(LocalDate date) {
        return date == null ? "" : DISPLAY_DATE.format(date);
    }

    public static String avatarInitials(String name) {
        if (name == null || name.isBlank()) {
            return "";
        }
        String[] parts = name.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length && initials.length() < 2; i++) {
            String part = parts[i];
            if (!part.isEmpty()) {
                initials.append(Character.toUpperCase(part.codePointAt(0)));
            }
        }
        return initials.toString();
    }

    private static String formatOneDecimal(double value) {
        DecimalFormat df = new DecimalFormat("0.#", TR_SYMBOLS);
        return df.format(value);
    }

    private static String formatOneDecimalDot(double value) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        symbols.setDecimalSeparator('.');
        DecimalFormat df = new DecimalFormat("0.#", symbols);
        return df.format(value);
    }
}
