from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Organization
from django.db import transaction


class Command(BaseCommand):
    help = 'Create the first Super Admin user (one-time setup).'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True, help='Super admin email')
        parser.add_argument('--password', required=True, help='Super admin password')
        parser.add_argument('--first-name', default='', help='First name')
        parser.add_argument('--last-name', default='', help='Last name')

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        email = options['email']
        password = options['password']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User {email} already exists.'))
            user = User.objects.get(email=email)
        else:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=options.get('first_name', ''),
                last_name=options.get('last_name', ''),
            )
            self.stdout.write(self.style.SUCCESS(f'Super admin user created: {email}'))

        # Ensure role is super_admin
        if user.role != 'super_admin':
            user.role = 'super_admin'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'User {email} set as Super Admin.'))

        # Create a default organization for the platform if none exists
        if not Organization.objects.filter(slug='platform').exists():
            Organization.objects.create(
                name='Platform',
                slug='platform',
                contact_email=email,
            )
            self.stdout.write(self.style.SUCCESS('Default "Platform" organization created.'))

        self.stdout.write(self.style.SUCCESS('Super admin setup complete.'))
