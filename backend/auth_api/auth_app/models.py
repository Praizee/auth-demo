from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — extend here rather than patching later.
    email is used as the display/contact field; username remains the login key.
    """

    class Role(models.TextChoices):
        MEMBER = "Member", "Member"
        ADMIN = "Admin", "Admin"

    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, default="")
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )

    class Meta:
        db_table = "users"

    def str(self) -> str:
        return self.username