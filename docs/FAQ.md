# Frequently Asked Questions (FAQ)

Common questions about the Health Tracking App, answered.

## Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Features & Usage](#features--usage)
- [Technical Questions](#technical-questions)
- [Troubleshooting](#troubleshooting)
- [Privacy & Security](#privacy--security)
- [Contributing](#contributing)

---

## General Questions

### What is the Health Tracking App?

The Health Tracking App is an open-source web application that helps users track their daily nutrition, weight, and exercise to achieve their health goals. It features:

- Daily calorie and macro tracking
- Weight trend visualization
- Custom nutrition goals
- USDA food database integration
- Exercise logging
- Responsive design for all devices

### Is it free?

Yes! The app is completely free and open-source under the MIT License. You can:
- Use it without any cost
- Self-host it on your own servers
- Modify it for your needs
- Contribute to development

### Is there a mobile app?

Not yet. Currently, the app is a responsive web application that works on mobile browsers. Native iOS and Android apps are planned for v2.1.0 (see [Roadmap](ROADMAP.md)).

### Can I use it offline?

Currently, no. The app requires an internet connection. Offline support via Progressive Web App (PWA) is planned for v1.2.0.

### Who created this?

The Health Tracking App was created by [Kai Huang](https://github.com/huangk24) as an open-source project. Contributions from the community are welcome!

---

## Getting Started

### How do I sign up?

1. Visit https://health-tracking-frontend.onrender.com
2. Click "Register"
3. Enter username, email, and password
4. Complete your profile (sex, age, height, weight, activity level, goal)
5. Start tracking!

### Do I need to provide accurate information?

Yes. The app calculates your daily calorie and macro goals based on your profile using the Mifflin-St Jeor equation for BMR and activity multipliers for TDEE. Inaccurate information will result in incorrect recommendations.

### What if I forget my password?

Password reset is not yet implemented (planned for v1.2.0). For now, you'll need to create a new account. To prevent this, use a strong password and store it securely (e.g., password manager).

### How do I delete my account?

Account deletion is not yet available in the UI. Contact support or (if self-hosting) delete your user record from the database. We're adding a self-service account deletion feature in v1.1.0.

---

## Features & Usage

### How are my nutrition goals calculated?

The app uses scientific formulas:

1. **BMR (Basal Metabolic Rate)**: Mifflin-St Jeor Equation
   - Male: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
   - Female: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

2. **TDEE (Total Daily Energy Expenditure)**: BMR × Activity Multiplier
   - Sedentary: 1.2
   - Lightly active: 1.375
   - Moderately active: 1.55
   - Very active: 1.725
   - Extra active: 1.9

3. **Goal Adjustment**:
   - Lose weight: -500 cal/day (1 lb/week loss)
   - Maintain: 0 cal adjustment
   - Gain weight: +500 cal/day (1 lb/week gain)

4. **Macros**:
   - Protein: 30% of calories
   - Carbs: 40% of calories
   - Fat: 30% of calories

### Can I set my own goals?

Yes! Use the "Custom Nutrition Goals" feature:

1. Go to your Profile page
2. Click "Customize my diet"
3. Select "Custom" mode
4. Set your desired daily calories and macro percentages
5. Save

Your dashboard will now use your custom targets instead of calculated ones.

### How do I log food?

Three ways:

1. **USDA Database** (350,000+ foods):
   - Click "Add Food"
   - Select "USDA Database"
   - Search for food
   - Select food and enter amount
   - Preview nutrition and confirm

2. **Custom Foods** (your saved foods):
   - Click "Add Food"
   - Select "My Custom Foods"
   - Choose from your library
   - Enter amount
   - Add

3. **Manual Entry**:
   - Click "Add Food"
   - Select "Manual Entry"
   - Enter food name and nutrition values
   - Add

### How do I save a food to my custom library?

1. Click "Add Food"
2. Select "My Custom Foods"
3. Click "Manage Custom Foods"
4. Click "Add New Food"
5. Enter name, serving unit, and nutrition info
6. Click "Save Custom Food"

### Can I edit or delete logged foods?

Yes! Expand any meal section to see individual entries. Each entry has a delete button. Editing is planned for a future release.

### How does weight tracking work?

Log your weight daily (or as often as you prefer):

1. Go to Profile page or Dashboard
2. Find "Weight Logger" section
3. Select date and enter weight
4. Click "Add Weight Entry"

The app will:
- Display your weight trend chart
- Calculate week-over-week changes
- Show progress toward your goal

### What's the weekly comparison feature?

Weekly Comparison shows:
- Current week's daily weights
- Previous week's daily weights
- Average weight per week
- Change (kg and percentage)
- Trend indicator (increasing/decreasing/stable)

This helps you see if you're on track with your goal.

### Can I log exercise?

Yes! Exercise logging allows you to:
- Add exercise activities
- Enter calories burned
- See net calories (food - exercise) on dashboard

The app adjusts your remaining calories based on exercise burned.

### Can I view past days?

Yes! Use the date selector on the Dashboard to view any date. You can also add/delete entries for past days.

### What timezone does the app use?

The app uses **Pacific Standard Time (PST)** for all dates. This is hardcoded currently but may become configurable in future versions.

---

## Technical Questions

### What technologies are used?

**Frontend:**
- React 18.3 with TypeScript
- Vite for fast builds
- Chart.js for visualizations
- Vitest for testing

**Backend:**
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- PostgreSQL (production) / SQLite (development)
- JWT authentication with bcrypt hashing
- pytest (90.7% test coverage)

See [Technical Decisions](development/TECH_DECISIONS.md) for rationale.

### Can I self-host?

Yes! See the [Development Guide](guides/DEVELOPMENT.md) for setup instructions. You'll need:
- Python 3.11+
- Node.js 18+
- Optional: PostgreSQL (can use SQLite)
- Optional: USDA API key

### What's the API documentation?

Full API documentation is available:
- **Interactive docs**: https://health-tracking-backend.onrender.com/docs (Swagger UI)
- **Alternative format**: https://health-tracking-backend.onrender.com/redoc
- **Written reference**: [API Reference](api/API_REFERENCE.md)

### Can I access the API programmatically?

Yes! All endpoints are RESTful and documented. You'll need to:
1. Register/login to get a JWT token
2. Include token in `Authorization: Bearer <token>` header
3. Make requests to documented endpoints

See [API Reference](api/API_REFERENCE.md) for details.

### How is data stored?

- **Production**: PostgreSQL database on Neon.tech
- **Development**: SQLite database (local file)

All user data is isolated (queries filter by user_id). Users can only access their own data.

### Is the code open-source?

Yes! The entire codebase is available on GitHub under the MIT License:
https://github.com/huangk24/health-tracking-app

You can:
- View the source code
- Report issues
- Submit pull requests
- Fork and modify
- Use commercially

---

## Troubleshooting

### The app is loading slowly or not at all

**Cause**: Free tier services on Render.com "sleep" after 15 minutes of inactivity.

**Solution**: Wait 30-60 seconds for the backend to wake up. First request may be slow, subsequent requests will be fast.

### I'm getting "Network Error" or "Backend not responding"

**Troubleshooting steps:**

1. Check backend health: https://health-tracking-backend.onrender.com/health
2. Clear browser cache and cookies
3. Try in incognito/private browsing mode
4. Check browser console for errors (F12)
5. If self-hosting, ensure backend is running

### My nutrition goals seem wrong

**Check these:**

1. **Profile completeness**: Ensure sex, age, height, weight, activity level, and goal are set
2. **Correct values**: Verify your profile information is accurate
3. **Custom nutrition**: Check if you have custom nutrition enabled (Profile page)
4. **Expected values**: Typical ranges are 1200-3000 calories/day

### Food search isn't working

**Possible causes:**

1. **Missing API key**: If self-hosting, ensure `USDA_API_KEY` is set in `.env`
2. **API down**: USDA API may be temporarily unavailable
3. **Short query**: Enter at least 2 characters

**Workaround**: Use Manual Entry to log foods manually.

### I can't delete an entry

**Check these:**

1. **Correct user**: You can only delete your own entries
2. **Entry exists**: Refresh the page and try again
3. **Network**: Check your internet connection

### Charts aren't displaying

**Troubleshooting:**

1. **JavaScript enabled**: Ensure JavaScript is enabled in browser
2. **Browser compatibility**: Use modern browser (Chrome, Firefox, Safari, Edge)
3. **Console errors**: Check browser console (F12) for errors
4. **Data**: Ensure you have logged data to display

---

## Privacy & Security

### What data do you collect?

We collect only what's necessary:

- **Account**: Username, email, hashed password
- **Profile**: Sex, age, height, weight, activity level, goal
- **Tracking**: Food entries, weight entries, exercise entries, custom foods

We do NOT collect:
- Payment information (app is free)
- Location data
- Browsing history
- Third-party tracking cookies

### How is my data protected?

**Security measures:**

1. **Passwords**: Hashed with bcrypt (12 rounds) - never stored in plain text
2. **Authentication**: JWT tokens with expiration
3. **HTTPS**: All traffic encrypted in transit
4. **User isolation**: Queries filtered by user_id - can't access other users' data
5. **SQL injection prevention**: Parameterized queries via ORM
6. **XSS prevention**: React auto-escapes rendered content

See [Security Policy](SECURITY.md) for details.

### Can others see my data?

No. All data is private and isolated per user. We do not have "social" features currently (planned for v2.1.0 with optional sharing).

### Can I export my data?

Not yet. Data export is planned for v1.1.0 (CSV and JSON formats).

### Can I delete my data?

Account and data deletion will be available in v1.1.0. Currently, contact support if you need your data deleted.

### Do you sell my data?

**Absolutely not.** We:
- Do not sell user data
- Do not share data with third parties
- Do not use data for advertising
- Are an open-source project, not a commercial product

### Is this HIPAA compliant?

**No.** This app is for personal health tracking, not medical diagnosis or treatment. It is not a medical device and is not HIPAA compliant.

**Important:** Do not use this app for medical purposes. Consult healthcare professionals for medical advice.

---

## Contributing

### How can I contribute?

Many ways to help:

1. **Code**: Submit pull requests for features/fixes
2. **Documentation**: Improve or add documentation
3. **Testing**: Report bugs or write tests
4. **Design**: Improve UI/UX
5. **Translation**: Help translate the app (future)
6. **Feedback**: Share ideas and suggestions

See [Contributing Guidelines](CONTRIBUTING.md) for details.

### I'm new to open-source. Where do I start?

Great! Welcome! 🎉

1. **Read**: [Contributing Guidelines](CONTRIBUTING.md)
2. **Setup**: Follow [Development Guide](guides/DEVELOPMENT.md)
3. **Look for**: Issues labeled `good first issue`
4. **Ask**: Don't hesitate to ask questions in issues/discussions
5. **Start small**: Fix typos, improve docs, add tests

### What skills are needed?

Depending on what you want to work on:

- **Backend**: Python, FastAPI, SQLAlchemy, pytest
- **Frontend**: TypeScript, React, CSS, Vitest
- **DevOps**: Docker, CI/CD, PostgreSQL
- **Design**: UI/UX, CSS, accessibility
- **Documentation**: Writing, Markdown

Don't have all skills? No problem! You can learn as you contribute.

### How long do pull requests take to review?

Typically:
- **Simple fixes** (typos, docs): 1-2 days
- **Small features**: 3-7 days
- **Large features**: 1-2 weeks

Reviews may take longer during busy periods. Be patient!

### My pull request was rejected. What now?

Don't be discouraged! Common reasons:

- Needs tests or documentation
- Doesn't align with project goals
- Code quality issues
- Breaking changes

Read the feedback, make improvements, and resubmit. All contributions are appreciated, even if not merged immediately.

---

## Still Have Questions?

### Search First

- **Documentation**: Check [docs/](README.md)
- **Issues**: Search [GitHub Issues](https://github.com/huangk24/health-tracking-app/issues)
- **Discussions**: Browse [GitHub Discussions](https://github.com/huangk24/health-tracking-app/discussions)

### Ask Away

- **General questions**: [GitHub Discussions](https://github.com/huangk24/health-tracking-app/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/huangk24/health-tracking-app/issues)
- **Feature requests**: [GitHub Issues](https://github.com/huangk24/health-tracking-app/issues)
- **Security concerns**: [Security Policy](SECURITY.md)

---

**Last Updated**: March 6, 2026  
**FAQ Version**: 1.0.0
