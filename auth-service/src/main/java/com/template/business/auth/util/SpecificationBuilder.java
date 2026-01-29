package com.template.business.auth.util;

import com.template.business.auth.dto.SearchRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class SpecificationBuilder {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static <T> Specification<T> buildSpecification(SearchRequest searchRequest) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Apply text/number filters
            if (searchRequest.getFilters() != null) {
                for (Map.Entry<String, String> entry : searchRequest.getFilters().entrySet()) {
                    String field = entry.getKey();
                    String value = entry.getValue();

                    if (value != null && !value.isEmpty()) {
                        try {
                            // Try to parse as number
                            if (value.matches("-?\\d+(\\.\\d+)?")) {
                                predicates.add(criteriaBuilder.equal(root.get(field), Double.parseDouble(value)));
                            } else {
                                // Text search with like
                                predicates.add(criteriaBuilder.like(
                                        criteriaBuilder.lower(root.get(field).as(String.class)),
                                        "%" + value.toLowerCase() + "%"
                                ));
                            }
                        } catch (Exception e) {
                            // If field doesn't exist or type mismatch, skip
                        }
                    }
                }
            }

            // Apply date range filters
            if (searchRequest.getDateRanges() != null) {
                for (Map.Entry<String, SearchRequest.DateRange> entry : searchRequest.getDateRanges().entrySet()) {
                    String field = entry.getKey();
                    SearchRequest.DateRange dateRange = entry.getValue();

                    try {
                        // Check if the field is of type Date or LocalDateTime
                        Class<?> fieldType = root.get(field).getJavaType();

                        if (Date.class.isAssignableFrom(fieldType)) {
                            // Handle java.util.Date
                            if (dateRange.getFrom() != null && !dateRange.getFrom().isEmpty()) {
                                LocalDate fromDate = LocalDate.parse(dateRange.getFrom(), DATE_FORMATTER);
                                Date fromDateValue = java.sql.Timestamp.valueOf(fromDate.atStartOfDay());
                                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                                        root.get(field), fromDateValue
                                ));
                            }

                            if (dateRange.getTo() != null && !dateRange.getTo().isEmpty()) {
                                LocalDate toDate = LocalDate.parse(dateRange.getTo(), DATE_FORMATTER);
                                Date toDateValue = java.sql.Timestamp.valueOf(toDate.atTime(23, 59, 59));
                                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                                        root.get(field), toDateValue
                                ));
                            }
                        } else {
                            // Handle LocalDateTime
                            if (dateRange.getFrom() != null && !dateRange.getFrom().isEmpty()) {
                                LocalDate fromDate = LocalDate.parse(dateRange.getFrom(), DATE_FORMATTER);
                                LocalDateTime fromDateTime = fromDate.atStartOfDay();
                                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                                        root.get(field), fromDateTime
                                ));
                            }

                            if (dateRange.getTo() != null && !dateRange.getTo().isEmpty()) {
                                LocalDate toDate = LocalDate.parse(dateRange.getTo(), DATE_FORMATTER);
                                LocalDateTime toDateTime = toDate.atTime(23, 59, 59);
                                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                                        root.get(field), toDateTime
                                ));
                            }
                        }
                    } catch (Exception e) {
                        // If date parsing fails or field doesn't exist, skip
                    }
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
