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
    Predict next month's expense using Linear Regression.
    Scoped to the logged-in user's own transaction history.
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
                "data_points_used": 0
            })

        df = pd.DataFrame(list(transactions))
        df['amount'] = df['amount'].astype(float)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        df['date_ordinal'] = df['date'].apply(lambda x: x.toordinal())

        X = df[['date_ordinal']].values
        y = df['amount'].values

        model = LinearRegression()
        model.fit(X, y)

        last_date_ordinal = df['date_ordinal'].max()
        future_date = np.array([[last_date_ordinal + 30]])
        prediction = model.predict(future_date)[0]

        if prediction <= 0:
            avg_spend = df['amount'].mean()
            prediction = avg_spend * 1.10
            msg = "Prediction based on average spending trend."
        else:
            msg = "AI prediction generated using Linear Regression."

        return Response({
            "predicted_spending_next_month": round(float(prediction), 2),
            "data_points_used": len(df),
            "message": msg,
            "algorithm": "Time-Series Regression"
        })
