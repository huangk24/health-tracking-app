# Health Tracking App - Copilot Instructions

## Project Overview
A health tracking application for monitoring daily calorie intake and consumption to support weight management goals (gain/loss).

## Current State
This is a greenfield project. The codebase is in initial setup phase with minimal structure. When implementing features, establish clear architectural decisions early.

## Development Guidelines

### Architecture Considerations
When building this app, consider:
- **Data Model**: User profiles, daily entries, food items, exercise activities, calorie tracking
- **Core Features**: Calorie intake logging, consumption/exercise tracking, daily/weekly summaries, weight progress tracking
- **User Flow**: Registration → Goal setting (weight gain/loss) → Daily logging → Progress visualization

### Technology Stack Recommendations
Before implementing, decide on:
- **Platform**: Web (React/Vue/Angular), Mobile (React Native/Flutter), or Desktop
- **Backend**: REST API vs GraphQL, database choice (SQL for relational data, NoSQL for flexibility)
- **Authentication**: User accounts and data privacy requirements
- **Data Persistence**: Local storage vs cloud sync considerations

### Key Features to Implement
1. **User Management**: Profile creation with weight goals and target calorie ranges
2. **Food Logging**: Quick entry system with calorie database or API integration (e.g., USDA FoodData)
3. **Activity Tracking**: Exercise logging with calorie burn calculations
4. **Dashboard**: Daily calorie balance (intake - consumption), progress charts, goal tracking
5. **History**: Historical data view, trends analysis, weekly/monthly summaries

### Development Workflow
- Document setup instructions in README.md as you establish the build system
- Include database schema or data models in documentation once designed
- Add environment variable templates (.env.example) for API keys or configuration
- Create clear separation between frontend/backend if building full-stack

### Naming Conventions
Use clear, domain-specific naming:
- `CalorieEntry`, `FoodItem`, `ExerciseActivity`, `UserProfile`, `WeightGoal`
- Prefer explicit names over abbreviations for health-related terms

### Data Validation
- Validate calorie values (positive numbers, reasonable ranges)
- Date/time handling for entry timestamps and timezone considerations
- User input sanitization for food names and notes

## Files to Create First
1. Technology choice documentation
2. Data model/schema definitions
3. API endpoint specifications (if applicable)
4. Setup/installation instructions in README.md
5. Configuration files (package.json, requirements.txt, etc.)

## Testing Strategy
When implementing tests:
- Unit tests for calorie calculations and data transformations
- Integration tests for database operations and API endpoints
- E2E tests for critical user flows (logging food, viewing progress)

---

*Update these instructions as architectural decisions are made and patterns emerge in the codebase.*
