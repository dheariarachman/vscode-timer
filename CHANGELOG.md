# Change Log

All notable changes to the "task-timer-management" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added

- Implemented project time tracking functionality
- Added status bar timer display showing current tracking session
- Added commands for starting and stopping time tracking
- Added daily summary view with project-wise time tracking statistics
- Added active timer details view
- Implemented persistent storage of time tracking records
- Added Git integration to track commit hashes and messages with time records
- Added detailed daily summary view with Git commit information
- Enhanced time tracking records with Git metadata

### Changed

- Migrated from SQLite to SQL.js for better web compatibility and reduced native dependencies
- Improved database state persistence with proper VS Code lifecycle event handling
- Enhanced status bar display with real-time tracking information
- Improved time record storage format to include Git information

### Fixed

- Database now properly saves on workspace changes and window state changes
- Added proper cleanup and database saving on extension deactivation
- Fixed issue where active timer sessions were not being saved when closing the editor
- Added proper cleanup and timer stopping on extension deactivation
- Ensured timer data is saved before extension deactivates

### Removed

- Removed SQLite3 dependency in favor of SQL.js

## [0.0.1]

- Initial release
