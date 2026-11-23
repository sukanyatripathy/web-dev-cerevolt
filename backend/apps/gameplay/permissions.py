from apps.accounts.models import ParentChildLink


def get_role(user):
    profile = getattr(user, 'profile', None)
    return getattr(profile, 'role', None)


def is_child(user):
    return get_role(user) == 'child'


def is_parent(user):
    return get_role(user) == 'parent'


def can_view_child(user, child_id):
    
    if is_child(user):
        return user.pk == child_id
    if is_parent(user):
        return ParentChildLink.objects.filter(
            parent=user, child_id=child_id, status='verified'
        ).exists()
    return False