import uuid
from decimal import Decimal

from django.db import transaction
from pyarrow import timestamp

from users.dtos.transaction_dto import TransactionDTO, TransactionResponseDTO, TransferDTO
from users.models import Account, Transaction

#Deposit
def deposit(dtos: TransactionDTO) -> TransactionResponseDTO:
    account = Account.objects.get(account_number = dtos.account_number)

    if dtos.amount <= 0:
        raise ValueError("Amount must be greater than 0")
    account.balance += dtos.amount
    account.save()

    tx = Transaction.objects.create(
        account = account,
        amount = dtos.amount,
        transaction_type = "deposit",
    )
    return TransactionResponseDTO(
        reference=tx.reference,
        account_number=account.account_number,
        amount = tx.amount,
        transaction_type = tx.transaction_type,
        timestamp = tx.timestamp,
        balance=account.balance,
    )

 #WITHDRAW
def withdraw(dtos: TransactionDTO) -> TransactionResponseDTO:
     account = Account.objects.get(account_number = dtos.account_number)

     if dtos.amount <= 0:
        raise ValueError("Amount must be greater than 0")

     if account.balance < dtos.amount:
         raise ValueError(f"insufficient funds to withdraw {dtos.amount}")

     account.balance -= dtos.amount
     account.save()

     tx = Transaction.objects.create(
         account = account,
         amount = dtos.amount,
         transaction_type = "withdraw",
     )
     return TransactionResponseDTO(
         reference=tx.reference,
         account_number=account.account_number,
         amount = dtos.amount,
         transaction_type = tx.transaction_type,
         timestamp = tx.timestamp,
         balance=account.balance,
     )

#TRANSFER
@transaction.atomic
def transfer(dtos: TransferDTO) -> TransactionResponseDTO:
    from_account = Account.objects.get(account_number = dtos.from_account)

    try:
        to_account = Account.objects.get(account_number = dtos.to_account)
    except Account.DoesNotExist:
        raise ValueError("Account you are trying to transfer money to  does not exist")

    if from_account == dtos.to_account:
        raise ValueError("Cannot transfer money to same account")

    if dtos.amount <= 0:
        raise ValueError("Amount must be greater than 0")
    if from_account.balance < dtos.amount:
        raise ValueError("insufficient funds to transfer")


    #Deduct
    from_account.balance -= dtos.amount
    from_account.save()

    #add
    to_account.balance += dtos.amount
    to_account.save()

    #record transaction for sender
    tx_sender = Transaction.objects.create(
        account = from_account,
        amount = dtos.amount,
        transaction_type = "transfer",
    )
    # record transaction for receiver
    Transaction.objects.create(
        account = to_account,
        amount = dtos.amount,
        transaction_type = "transfer",
    )
    return TransactionResponseDTO(
        reference= tx_sender.reference,
        transaction_type="transfer",
        amount=dtos.amount,
        timestamp=tx_sender.timestamp,
        account_number = from_account.account_number,
        to_account=to_account.account_number,
        balance=from_account.balance,
    )


