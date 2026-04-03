from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from datetime import datetime



#INPUT dtos (for account creation)
@dataclass
class CreateAccountDTO:
    first_name: str
    last_name: str
    id_number: str
    phone_number: str
    email: str
    password: str



# OUTPUT dtos (for returning account info)
@dataclass
class AccountDTO:
    account_number: str
    balance: Decimal
    first_name: str
    last_name: str


@dataclass
class AccountResponseDTO(AccountDTO):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None