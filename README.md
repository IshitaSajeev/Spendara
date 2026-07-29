# 💰 Spendara

> AI-powered personal finance tracker with JWT authentication, ML-driven spending forecasts, and category-level insights.

[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-ff1709?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [API Endpoints](#-api-endpoints)
- [Machine Learning](#-machine-learning)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **🔐 JWT Authentication** – Secure user registration and login
- **📊 Expense Tracking** – Add, edit, and delete expenses with categories
- **📈 Spending Insights** – Visualize spending patterns with charts
- **🤖 ML-Powered Forecasts** – Predict future spending using linear regression
- **📱 Responsive Dashboard** – Works on desktop, tablet, and mobile
- **🔄 Real-time Updates** – Instant feedback on actions

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Django** | Web framework |
| **Django REST Framework** | REST API development |
| **Simple JWT** | Authentication |
| **Scikit-Learn** | ML forecasting |
| **Pandas** | Data processing |
| **PostgreSQL** | Production database |

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React** | UI framework |
| **Axios** | API calls |
| **Chart.js** | Data visualization |
| **Tailwind CSS** | Styling |

---

## 🏗️ Architecture

```mermaid
flowchart TD

    subgraph Frontend["React Frontend"]
        A[Dashboard]
        B[Expense Management]
        C[ML Predictions]
    end

    D[Axios API Calls]

    subgraph Backend["Django REST API"]
        E[JWT Authentication]
        F[Expense CRUD API]
        G[ML Forecast API]
    end

    H[Django ORM]

    subgraph Database["PostgreSQL Database"]
        I[(Users)]
        J[(Expenses)]
        K[(ML Predictions)]
    end

    A --> D
    B --> D
    C --> D

    D --> E
    D --> F
    D --> G

    E --> H
    F --> H
    G --> H

    H --> I
    H --> J
    H --> K
```

---

## 🚀 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- pip

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/IshitaSajeev/Spendara.git
cd Spendara

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pandas scikit-learn numpy

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run the server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
## 📖 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Create a new user account |
| `POST` | `/api/token/` | Log in, returns access + refresh JWT |
| `POST` | `/api/token/refresh/` | Refresh an expired access token |
| `GET` / `POST` | `/api/transactions/` | List or create transactions (user-scoped) |
| `GET` / `PUT` / `DELETE` | `/api/transactions/<id>/` | Retrieve, update, or delete a transaction |
| `GET` / `POST` | `/api/categories/` | List or create categories (user-scoped) |
| `GET` | `/api/categories/summary/` | Spending totals grouped by category (chart data) |
| `GET` | `/api/forecast/` | Next month's predicted spending (Linear Regression) |

### Sample API Call

```bash
# Login and get token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}'

# Get spending forecast
curl -X GET http://localhost:8000/api/forecast/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

#Sample Response
{
  "status": "success",
  "forecast": [
    {"month": "August 2026", "predicted_spending": 12450.75},
    {"month": "September 2026", "predicted_spending": 13280.20}
  ],
  "confidence_score": 0.87
}
