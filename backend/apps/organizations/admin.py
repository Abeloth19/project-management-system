from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'contact_email', 'project_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'contact_email', 'slug']
    readonly_fields = ['slug', 'created_at', 'updated_at', 'project_count', 'active_project_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'contact_email', 'is_active')
        }),
        ('Generated Fields', {
            'fields': ('slug',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('project_count', 'active_project_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )