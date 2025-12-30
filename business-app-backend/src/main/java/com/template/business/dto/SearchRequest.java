package com.template.business.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    private Map<String, String> filters;
    private Map<String, DateRange> dateRanges;
    private SortInfo sort;
    private int page;
    private int pageSize;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateRange {
        private String from;
        private String to;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SortInfo {
        private String column;
        private String order; // "asc" or "desc"
    }
}
