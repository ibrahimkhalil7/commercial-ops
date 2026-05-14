from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seed demo data: users, team, sample outlet'

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        from apps.outlets.models import Outlet, OutletCategory
        from apps.users.models import Team

        User = get_user_model()

        # Create roles
        admin_email = 'admin@local'
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(email=admin_email, password='adminpass123', first_name='Admin', last_name='User')
            self.stdout.write(self.style.SUCCESS(f'Created superuser {admin_email}'))

        manager_email = 'manager@local'
        manager, created = User.objects.get_or_create(email=manager_email, defaults={'first_name':'Manager','last_name':'User','role':'manager'})
        if created:
            manager.set_password('managerpass')
            manager.save()
            self.stdout.write(self.style.SUCCESS(f'Created manager {manager_email}'))

        agent_email = 'agent@local'
        agent, created = User.objects.get_or_create(email=agent_email, defaults={'first_name':'Field','last_name':'Agent','role':'field_agent'})
        if created:
            agent.set_password('agentpass')
            agent.save()
            self.stdout.write(self.style.SUCCESS(f'Created field agent {agent_email}'))

        outlet_mgr_email = 'outlet@local'
        outlet_mgr, created = User.objects.get_or_create(email=outlet_mgr_email, defaults={'first_name':'Outlet','last_name':'Manager','role':'outlet_manager'})
        if created:
            outlet_mgr.set_password('outletpass')
            outlet_mgr.save()
            self.stdout.write(self.style.SUCCESS(f'Created outlet manager {outlet_mgr_email}'))

        # Create a sample outlet category and outlet
        cat, _ = OutletCategory.objects.get_or_create(name='Demo Category')
        outlet, created = Outlet.objects.get_or_create(name='Demo Outlet', defaults={
            'category':cat,
            'address':'Demo Address',
            'latitude':27.255,
            'longitude':33.679,
        })
        if created:
            self.stdout.write(self.style.SUCCESS('Created demo outlet'))

        # Create a team and assign agent
        team, _ = Team.objects.get_or_create(name='Demo Team', defaults={'manager': manager})
        team.members.add(agent)
        self.stdout.write(self.style.SUCCESS('Seed demo data complete'))
