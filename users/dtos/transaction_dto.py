from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime
from typing import Optional

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
    from_account: str
    to_account: str
    amount: Decimal



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