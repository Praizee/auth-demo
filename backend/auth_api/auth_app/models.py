from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — extend here rather than patching later.
    email is used as the display/contact field; username remains the login key.
    """

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("user", "User"),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="user"
    )
    bio = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return self.username