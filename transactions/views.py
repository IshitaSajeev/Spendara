from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

# ================================
# TRANSACTION VIEWS
# ================================

class TransactionListCreate(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return the logged-in user's own transactions
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Prevents users from viewing/editing/deleting someone else's transaction
        return Transaction.objects.filter(user=self.request.user)


# ================================
# CATEGORY VIEWS
# ================================

class CategoryList(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ================================
# CATEGORY SPENDING SUMMARY (for chart)
# ================================

class CategorySummaryView(generics.GenericAPIView):
    """
    Returns total EXPENSE amount grouped by category for the logged-in user.
    Powers the spending-by-category pie/bar chart on the frontend.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = (
            Transaction.objects.filter(user=request.user, transaction_type='EXPENSE')
            .values('category__name')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        results = [
            {"category": row["category__name"] or "Uncategorized", "total": float(row["total"])}
            for row in data
        ]
        return Response(results)


# ================================
# AI BUDGET FORECAST VIEW
# ================================

class BudgetForecastView(generics.GenericAPIView):
    """
    Predict next month's TOTAL expense using Linear Regression.

    Aggregates expenses into monthly totals, then fits the regression on
    (month_index -> total), so "predicted_spending_next_month" means "sum of
    all expenses predicted for next month" rather than "size of the next
    transaction".

    Important: the current, still-in-progress month is EXCLUDED from the
    regression training data. Comparing a complete month against a partial
    one would make spending look like it's dropping simply because the
    month isn't over yet — not because spending actually decreased.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(
            user=request.user,
            transaction_type__iexact='EXPENSE'
        ).values('amount', 'date')

        if not transactions.exists():
            return Response({
                "predicted_spending_next_month": 0,
                "message": "No expense data found.",
                "data_points_used": 0,
                "months_used": 0,
            })

        df = pd.DataFrame(list(transactions))
        df['amount'] = df['amount'].astype(float)
        df['date'] = pd.to_datetime(df['date'])

        df['month'] = df['date'].dt.to_period('M')
        monthly = df.groupby('month')['amount'].sum().sort_index()

        current_month = pd.Timestamp.now().to_period('M')
        current_month_total = float(monthly.get(current_month, 0))

        # Only train on months that have fully finished (strictly before the
        # current month) — this also guards against stray future-dated
        # transactions being miscounted as "completed".
        completed_months = monthly[monthly.index < current_month]

        if len(completed_months) < 2:
            fallback = float(completed_months.iloc[-1]) if len(completed_months) == 1 else current_month_total
            return Response({
                "predicted_spending_next_month": round(fallback, 2),
                "data_points_used": len(df),
                "months_used": len(completed_months),
                "current_month_to_date": round(current_month_total, 2),
                "message": "Not enough completed months of history yet — showing the most recent full month's total instead of a trend prediction.",
                "algorithm": "Insufficient history (fallback)",
            })

        X = np.arange(len(completed_months)).reshape(-1, 1)
        y = completed_months.values

        model = LinearRegression()
        model.fit(X, y)

        next_month_index = np.array([[len(completed_months)]])
        prediction = model.predict(next_month_index)[0]

        if prediction <= 0:
            prediction = float(completed_months.mean())
            msg = "Trend predicted a non-positive value, so showing the average of completed months instead."
        else:
            msg = "AI prediction generated using Linear Regression on completed monthly totals."

        return Response({
            "predicted_spending_next_month": round(float(prediction), 2),
            "data_points_used": len(df),
            "months_used": len(completed_months),
            "current_month_to_date": round(current_month_total, 2),
            "message": msg,
            "algorithm": "Linear Regression (completed monthly totals)",
        })