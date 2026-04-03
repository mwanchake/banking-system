from django.urls import path

from .views import create_account_view, deposit_view, withdrawal_view, transfer_view, login_view

urlpatterns = [
    path('create_account/',create_account_view),
    path('login/',login_view),
    path('deposit/',deposit_view),
    path('withdraw/',withdrawal_view),
    path('transfer/',transfer_view),
]