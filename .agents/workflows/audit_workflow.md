---
description: Comprehensive Website Engineering & Infrastructure Audit
---

# Audit Workflow

Execute a deep-dive, 10-dimensional architectural and performance audit of the current workspace repository.

1. Architecture: Ingest the codebase. Evaluate the tech stack, modularity, and adherence to clean architecture (SOLID/DRY principles). Output to 01_architecture_audit.md.
2. Performance: Utilize the integrated browser agent to run a Lighthouse performance audit on the local staging environment. Extract LCP, CLS, and INP metrics. Analyze caching and lazy-loading. Output to 02_performance_audit.md.
3. SEO Engineering: Analyze the DOM for semantic HTML structure (H1-H6), Schema.org JSON-LD structured data, and internal linking crawlability. Output to 03_seo_audit.md.
4. Backend & Infrastructure: Review database schemas, API structures, query inefficiencies (e.g., N+1 problems), and horizontal scalability readiness. Output to 04_backend_audit.md.
5. Automation: Trace lead capture workflows, CRM integrations, and webhook listeners. Check for retry mechanisms and error logging. Output to 05_automation_audit.md.
6. Security: Conduct a static code analysis against the OWASP Top 10 framework. Check for SQLi, XSS, CSRF, and validate JWT/Authentication handling. Output to 06_security_audit.md.
7. UI/UX Quality: Review visual states and responsive design. Determine if it utilizes a mobile-first approach and a premium, conversion-optimized design. Output to 07_ui_ux_audit.md.
8. Elite Benchmarking: Compare the current application specifically against Apple's Human Interface and data privacy standards, and Amazon's AWS CIS foundational benchmarks and aggressive latency standards. Output to 08_benchmark_comparison.md.
9. Final Verdict: Synthesize all data to rate the website on the required 4-tier scale (Beginner to Elite/FAANG). Justify the rating. Output to 09_final_verdict.md.
10. Roadmap: Translate all flaws into a prioritized improvement roadmap. Group tasks by impact-to-effort ratio. Format the roadmap as a list of executable Antigravity slash commands. Output to 10_improvement_roadmap.md.
