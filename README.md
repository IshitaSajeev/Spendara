# 💸 Spendara: AI-Powered Personal Finance Tracker

Spendara is a full-stack personal finance application that bridges everyday expense tracking with Machine Learning-driven forecasting. It uses a Linear Regression model trained on your own transaction history to project next month's spending, alongside secure per-user accounts and category-level spending insights.

---

### Key Features

- **AI Budget Forecasting** — a Scikit-Learn Linear Regression model predicts next month's spend from your time-series transaction history.
- **Secure Authentication** — JWT-based login and registration; every transaction and category is scoped to the logged-in user.
- **Spending by Category** — a live pie chart breaks down expenses by category as you log them.
- **Add Transactions** — log income or expenses on the fly, with the option to create new categories inline.
- **Premium UI/UX** — a high-contrast, dark-mode dashboard built with React, Tailwind CSS, and Framer Motion.

### The Machine Learning Engine

- **Algorithm:** Ordinary Least Squares (OLS) Linear Regression.
- **Process:** The system extracts EXPENSE-type transactions for the logged-in user, converts dates into ordinal values, and trains a model to identify the slope of spending.
- **Fallback Logic:** Includes smart-averaging fallbacks for small datasets, so the UI always shows a meaningful forecast.

### Tech Stack

**Frontend**
- Framework: React (Vite)
- Styling: Tailwind CSS
- Animation: Framer Motion
- Charts: Recharts
- Icons: Lucide React
- Routing: React Router
- HTTP Client: Axios

**Backend**
- Framework: Django & Django REST Framework
- Auth: djangorestframework-simplejwt (JWT)
- Database: SQLite
- Scientific Computing: Pandas, NumPy, Scikit-Learn

---

### Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/spendara.git
cd spendara
```

**2. Backend setup**
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pandas scikit-learn numpy

python manage.py migrate
python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000/`.

**3. Frontend setup** (in a new terminal)
```bash
cd spendara_frontend
npm install
npm run dev
```
Frontend runs at `http://127.0.0.1:5173/`.

**4. First run**
- Open the frontend URL, click **Sign up** to create an account.
- Once logged in, click **Add** to log your first transaction.
- The forecast and category chart populate automatically as you add expenses.

### Project Structure
```
├── spendara_backend/       # Django project settings, URLs, WSGI/ASGI
├── accounts/                # User registration
├── transactions/            # Transaction & category models, views, ML forecast logic
├── spendara_frontend/
│   ├── src/
│   │   ├── api/              # Axios instance with JWT attach/refresh
│   │   ├── context/          # Auth context
│   │   ├── components/       # Reusable UI (modals, charts, spinner, glow card)
│   │   ├── pages/             # Login, Register, Dashboard
│   └── tailwind.config.js
├── manage.py
└── README.md
```

### API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register/` | POST | Create a new user account |
| `/api/token/` | POST | Log in, returns access + refresh JWT |
| `/api/token/refresh/` | POST | Refresh an expired access token |
| `/api/transactions/` | GET, POST | List or create transactions (user-scoped) |
| `/api/transactions/<id>/` | GET, PUT, DELETE | Retrieve, update, or delete a transaction |
| `/api/categories/` | GET, POST | List or create categories (user-scoped) |
| `/api/categories/summary/` | GET | Spending totals grouped by category (chart data) |
| `/api/forecast/` | GET | Next month's predicted spending (Linear Regression) |

### Roadmap
- [ ] Monthly budget limits with overspend alerts
- [ ] CSV export of transaction history
- [ ] Multi-currency support
