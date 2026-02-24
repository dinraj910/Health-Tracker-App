# Changelog

All notable changes to MediTrack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Analytics Overhaul**: Added Blood Sugar and Body Temperature trending charts for "Doctor-Ready" reporting.
- **Sidebar Collapse Fix**: Fixed content margin adjustment and logo visibility in collapsed state.
- **Improved Vitals Modals**: Mobile-first input for all vitals.

### Changed
- **Dashboard Redesign**: Simplified UI by removing clutter (mood widget, progress rings, stats row). Focused on medicine summary and actionable vitals.

### Fixed
- **Medicine Log Persistence**: Fixed bug where newest medicine logs would overwrite old ones for the same day.
- **Linting & Code Quality**: Fixed all frontend linting issues and optimized Vite Fast Refresh support by separating providers and hooks.
- **Mobile UI**: Improved touch targets and layout responsiveness.

## [0.1.0] - 2025-11-28

### Added
- Initial project setup
- Frontend with React 19, Vite, and Tailwind CSS 4
- Backend with Node.js and Express
- Dark mode UI theme (mobile-first)
- Authentication pages (Login, Register)
- Home page with features showcase
- GitHub Actions CI/CD pipeline
- Project documentation
