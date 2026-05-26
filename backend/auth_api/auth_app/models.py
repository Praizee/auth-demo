from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — extend here rather than patching later.
    email is used as the display/contact field; username remains the login key.
    """

    email = models.EmailField(unique=True)

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return self.username
