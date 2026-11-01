from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates the initial Super Admin account securely for platform ownership.'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@campustag.edu', help='Super admin email')
        parser.add_argument('--username', type=str, default='superadmin', help='Super admin username')
        parser.add_argument('--password', type=str, default='CampusTag2026!SecureAdmin', help='Super admin password')
        parser.add_argument('--name', type=str, default='System Administrator', help='Super admin full name')

    def handle(self, *args, **options):
        email = options['email']
        username = options['username']
        password = options['password']
        name = options['name']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"Super admin user {email} already exists."))
            return

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=name.split()[0],
            last_name=" ".join(name.split()[1:]) if len(name.split()) > 1 else "",
            role='super_admin',
            status='active'
        )

        self.stdout.write(self.style.SUCCESS(f"Successfully created Super Admin user: {email}"))
        self.stdout.write(self.style.SUCCESS(f"Credentials -> Username: {username} | Password: {password}"))
