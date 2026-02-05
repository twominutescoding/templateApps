package com.template.business.controller;

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
     * - /auth/** (Auth API endpoints)
     * - /demo/** (Demo API endpoints)
     * - /swagger-ui/** (API documentation)
     * - /api-docs/** (OpenAPI docs)
     * - /h2-console/** (H2 database console)
     * - Static resources (files with extensions like .js, .css, .html, etc.)
     */
    @RequestMapping(value = {
        "/",
        "/login",
        "/components",
        "/components/data-visualization",
        "/components/form-components",
        "/components/ui-components",
        "/components/advanced-features",
        "/components/business-specific",
        "/components/comprehensive-demo",
        "/settings",
        "/profile",
        "/instructions"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
