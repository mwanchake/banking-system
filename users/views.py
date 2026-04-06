from django.contrib.auth import authenticate
import traceback

from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from users.dtos.account_dto import CreateAccountDTO
from users.dtos.transaction_dto import TransactionDTO, TransferDTO
from users.models import Account
from users.services.account_service import create_account

from rest_framework.response import Response

from rest_framework import status

from users.services.transaction_service import deposit, withdraw, transfer, transaction_history_service

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Transaction

from django.shortcuts import render

def home(request):
    return render(request, "index.html")


@api_view(['POST'])
def create_account_view(request):
    try:
        dto = CreateAccountDTO(
            first_name = request.data.get("first_name"),
            last_name= request.data.get("last_name"),
            id_number= request.data.get("id_number"),
            phone_number= request.data.get("phone_number"),
            password= request.data.get("password"),
            email= request.data.get("email"),
        )

        account = create_account(dto)
        return Response({
        "message": "Account created successfully",
        "account": account.account_number,
        "balance": account.balance,
        }, status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error" : str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    try:
        id_number = request.data.get("id_number")
        password = request.data.get("password")

        if not id_number or not password:
            return Response({"error": "id and password are required to log in "}, status=400)

        user = authenticate(username=id_number, password=password)
        if user is None:
            return Response({"error": "invalid credentials"}, status=400)
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=200)



    except Exception as e:
        return Response({"error" : str(e)}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_view(request):
    try:
        account = Account.objects.get(user = request.user)
        amount = request.data.get("amount")

        dto = TransactionDTO(
            account_number = account.account_number,
            amount = amount
        )
        tx = deposit(dto)

        return Response({
            "message": "Account deposited successfully",
            "reference": tx.reference,
            "account": tx.account_number,
            "Amount": tx.amount,
            "Timestamp": tx.timestamp,
            "New Balance": tx.balance,
            "Transaction Type": tx.transaction_type,


        },status= status.HTTP_201_CREATED)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error" : str(e)}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdrawal_view(request):
    try:
        account = Account.objects.get(user = request.user)
        amount = request.data.get("amount")

        dto = TransactionDTO(
            account_number = account.account_number,
            amount = amount
        )
        txt = withdraw(dto)

        return Response({
            "message": "Account withdrawn successfully",
            "reference": txt.reference,
            "amount": txt.amount,
            "account": txt.account_number,
            "Timestamp": txt.timestamp,
            "New Balance": txt.balance,
        },status = status.HTTP_201_CREATED)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error" : str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer_view(request):
    try:
        from_account = Account.objects.get(user = request.user)
        to_account = Account.objects.get(account_number = request.data.get("to_account"))
        amount = Decimal(request.data.get("amount"))

        dto = TransferDTO(
            user = request.user,
            from_account = from_account,
            to_account = to_account,
            amount = amount,

        )
        tx = transfer(dto)

        return Response({
            "message": "Account transfer successfully",
            "reference": tx.reference,
            "amount": tx.amount,
            "from_account": tx.account_number,
            "to_account": tx.to_account,
            "timestamp": tx.timestamp,
            "balance": tx.balance,
        },status = status.HTTP_200_OK)
    except Exception as e:
        print(traceback.format_exc())
        return Response({"error" : str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        user = request.user
        account = Account.objects.get(user=user)
        return Response({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number":account.phone_number,
            "account":account.account_number,
        })
    except Exception as e:
        return Response({"error" : str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def account_view(request):
    try:
        user = request.user
        account = Account.objects.get(user=user)
        return Response({
            "account_number": account.account_number,
            "balance": account.balance,
        })
    except Exception as e:
        return Response({"error" : str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    try:
        user = request.user
        account = Account.objects.get(user=user)
        return Response({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": account.phone_number,
            "account_number": account.account_number,
            "balance": account.balance,
        })
    except Account.DoesNotExist:
        return Response({"error" : "Account does not exist"}, status=400)
    except Exception as e:
        return Response({"error" : str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history_view(request):
    transactions = Transaction.objects.filter(user=request.user).order_by("-timestamp")

    print("COUNT:", transactions.count())

    data = []
    for tx in transactions:
        data.append({
            "reference": tx.reference,
            "amount": tx.amount,
            "transaction_type": tx.transaction_type,
            "timestamp": tx.timestamp,
        })

    print("DATA LENGTH:", len(data))

    return Response({
        "count": len(data),
        "data": data
    }, status=200)