from rest_framework import permissions

class IsSuperAdminUser(permissions.BasePermission):
    """
    Allows access only to authenticated super admins / platform owners.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.role == 'super_admin'))


class IsTenantMember(permissions.BasePermission):
    """
    Enforces tenant workspace boundaries. Users may only access objects
    bound to their own tenant workspace.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role == 'super_admin':
            return True
        return hasattr(obj, 'tenant') and obj.tenant == request.user.tenant
