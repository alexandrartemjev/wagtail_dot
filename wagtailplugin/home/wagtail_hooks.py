# -*- coding: utf-8 -*-
from django.urls import reverse
from django.utils.safestring import mark_safe

from wagtail.core import hooks
from wagtail.admin.menu import MenuItem
from wagtail.contrib.modeladmin.options import ModelAdmin, ModelAdminGroup, modeladmin_register

from wagtailplugin.home.models import Metro, MetroMap, City


@hooks.register('construct_main_menu')
def hide_snippets_menu_item(request, menu_items):
    menu_items[:] = [item for item in menu_items if item.label != u'Фрагменты']


class CityAdmin(ModelAdmin):
    model = City
    menu_icon = 'site'
    menu_order = 800
    list_display = ['name']

class MetroAdmin(ModelAdmin):
    model = Metro
    menu_icon = 'site'
    list_display = ['title', 'get_color']
    list_filter = ['color']
    search_fields = ['title']
    menu_label = u'Станции метро'

    def get_color(self, obj):
        return mark_safe('<div style="width:5px; height:5px; color: %s"></div>' % obj.color)
    get_color.short_description = u'Ветка'


class MetroMapAdmin(ModelAdmin):
    model = MetroMap
    menu_icon = 'site'
    list_display = ['city']
    list_filter = ['city']


class MetroAdminGroup(ModelAdminGroup):
    menu_label = u'Метро'
    menu_icon = 'site'
    menu_order = 900
    items = [MetroAdmin, MetroMapAdmin]


modeladmin_register(CityAdmin)
modeladmin_register(MetroAdminGroup)
