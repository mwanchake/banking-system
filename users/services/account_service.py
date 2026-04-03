import random
from decimal import Decimal


from users.models import Account, User



from users.dtos.account_dto import CreateAccountDTO, AccountResponseDTO, AccountDTO


def generate_account_number():
    return str(random.randint(10000, 99999999))

#create account
def create_account(dtos: CreateAccountDTO) -> AccountResponseDTO:
    if User.objects.filter(id_number=dtos.id_number).exists():
        raise ValueError("Account already exists")

    #create user
    user = User.objects.create(
        first_name=dtos.first_name,
        last_name=dtos.last_name,
        id_number=dtos.id_number,
        email=dtos.email,
    )
    #link user to account
    account_number = generate_account_number()
    account = Account.objects.create(
        user=user,
        account_number=account_number,
        balance = Decimal("0.00")
    )
    return AccountResponseDTO(
        account_number=account.account_number,
        balance=account.balance,
        first_name=user.first_name,
        last_name=user.last_name,
    )

def get_account(account_number:str) -> AccountResponseDTO:
    account  = Account.objects.get(account_number = account_number)
    user = account.user
    return AccountResponseDTO(
        account_number=account.account_number,
        balance=account.balance,
        first_name= user.first_name,
        last_name= user.last_name,

    )