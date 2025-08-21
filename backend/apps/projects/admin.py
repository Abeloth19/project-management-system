from django.contrib import admin
from django.utils.html import format_html
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'organization', 
        'status_badge', 
        'task_count', 
        'completion_percentage', 
        'due_date',
        'is_overdue_display',
        'created_at'
    ]
    list_filter = ['status', 'organization', 'due_date', 'created_at']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = [
        'task_count', 
        'completed_task_count', 
        'completion_percentage', 
        'is_overdue',
        'created_at', 
        'updated_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('organization', 'name', 'description', 'status')
        }),
        ('Timeline', {
            'fields': ('due_date',)
        }),
        ('Statistics', {
            'fields': ('task_count', 'completed_task_count', 'completion_percentage', 'is_overdue'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'ACTIVE': '#28a745',
            'COMPLETED': '#007bff', 
            'ON_HOLD': '#ffc107',
            'CANCELLED': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">⚠️ Overdue</span>')
        return '✓'
    is_overdue_display.short_description = 'Due Status'