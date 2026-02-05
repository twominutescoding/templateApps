package com.template.business.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to forward SPA routes to index.html.
 * This allows React Router to handle client-side routing.
 */
@Controller
public class SpaController {

    /**
     * Forward all non-API, non-static routes to index.html for SPA routing.
     * Excludes:
     * - /api/** (REST API endpoints)
     * - /auth/api/** (Auth API endpoints)
     * - /swagger-ui/** (API documentation)
     * - /v3/api-docs/** (OpenAPI docs)
     * - /h2-console/** (H2 database console)
     * - Static resources (files with extensions like .js, .css, .html, etc.)
     */
    @RequestMapping(value = {
        "/",
        "/login",
        "/dashboard",
        "/users",
        "/roles",
        "/sessions",
        "/entities",
        "/mailings",
        "/logs",
        "/settings",
        "/instructions"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
