from django.contrib import admin
from django.utils.html import format_html
from .models import Task, TaskComment


class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    readonly_fields = ['created_at']
    fields = ['author_email', 'content', 'created_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'project',
        'status_badge',
        'priority_badge', 
        'assignee_email',
        'comment_count',
        'due_date',
        'is_overdue_display',
        'created_at'
    ]
    list_filter = ['status', 'priority', 'project__organization', 'project', 'due_date', 'created_at']
    search_fields = ['title', 'description', 'assignee_email', 'project__name']
    readonly_fields = ['comment_count', 'is_overdue', 'can_start', 'is_completed', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    inlines = [TaskCommentInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('project', 'title', 'description')
        }),
        ('Assignment & Priority', {
            'fields': ('status', 'priority', 'assignee_email', 'due_date')
        }),
        ('Status Properties', {
            'fields': ('can_start', 'is_completed', 'is_overdue'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('comment_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'TODO': '#6c757d',
            'IN_PROGRESS': '#007bff',
            'DONE': '#28a745',
            'BLOCKED': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def priority_badge(self, obj):
        colors = {
            'LOW': '#28a745',
            'MEDIUM': '#ffc107', 
            'HIGH': '#fd7e14',
            'URGENT': '#dc3545'
        }
        color = colors.get(obj.priority, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'
    
    def is_overdue_display(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">⚠️ Overdue</span>')
        return '✓'
    is_overdue_display.short_description = 'Due Status'


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author_email', 'content_preview', 'created_at']
    list_filter = ['task__project__organization', 'task__project', 'created_at']
    search_fields = ['content', 'author_email', 'task__title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Comment Information', {
            'fields': ('task', 'author_email', 'content')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'