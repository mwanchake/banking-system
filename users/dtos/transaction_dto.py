from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime
from typing import Optional

from users.models import Account
from users.models import User


#INPUT dtos
@dataclass
class TransactionDTO:
    """
    Generic transaction input for deposit or withdraw
    """
    account_number: str
    amount: Decimal
    to_account: Optional[str] = None


@dataclass
class TransferDTO:
    """
    Transfer input from one account to another
    """
    from_account: Account
    to_account: Account
    amount: Decimal
    user : User




# OUTPUT dtos
@dataclass
class TransactionResponseDTO:
    reference: str
    account_number: str
    amount: Decimal
    transaction_type: str  # deposit / withdraw / transfer
    timestamp: datetime
    balance: Decimal
    to_account: Optional[str] = None  # only for transfers