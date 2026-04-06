from django.urls import path

from .views import create_account_view, deposit_view, withdrawal_view, transfer_view, login_view, profile_view, \
    account_view, dashboard_view, transaction_history_view

urlpatterns = [
    path('create_account/',create_account_view),
    path('login/',login_view),
    path('deposit/',deposit_view),
    path('withdraw/',withdrawal_view),
    path('transfer/',transfer_view),
    path("profile/",profile_view),
    path("account_info/",account_view),
    path('dashboard/',dashboard_view),
    path('history/',transaction_history_view),
]