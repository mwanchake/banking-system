from django.contrib.auth import authenticate

from rest_framework.decorators import api_view

from users.dtos.account_dto import CreateAccountDTO
from users.dtos.transaction_dto import TransactionDTO, TransferDTO
from users.services.account_service import create_account

from rest_framework.response import Response

from rest_framework import status

from users.services.transaction_service import deposit,withdraw,transfer


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

        return Response({
            "message": "Login successful",
            "user": user.username,
        }, status=200)



    except Exception as e:
        return Response({"error" : str(e)}, status=400)



@api_view(['POST'])
def deposit_view(request):
    try:
        account_number = request.data.get("account_number")
        amount = request.data.get("amount")

        dto = TransactionDTO(
            account_number = account_number,
            amount = amount
        )
        tx = deposit(dto)



        return Response({
            "message": "Account deposited successfully",
            "reference": tx.reference,
            "account": tx.account_number,
            "Amount": amount,
            "Timestamp": tx.timestamp,
            "New Balance": tx.balance,
            "Transaction Type": tx.transaction_type,


        },status= status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error" : str(e)}, status=400)
@api_view(['POST'])
def withdrawal_view(request):
    try:
        account_number = request.data.get("account_number")
        amount = request.data.get("amount")

        dto = TransactionDTO(
            account_number = account_number,
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
        return Response({"error" : str(e)}, status=400)

@api_view(['POST'])
def transfer_view(request):
    try:
        dto = TransferDTO(
            from_account = request.data.get("from_account"),
            to_account=request.data.get("to_account"),
            amount = request.data.get("amount"),

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
        return Response({"error" : str(e)}, status=400)

