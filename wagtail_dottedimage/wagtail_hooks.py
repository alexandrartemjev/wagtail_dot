# -*- coding: utf-8 -*-
from wagtail.core import hooks


@hooks.register('insert_editor_js')
def dottedimage_js():
    js = [
        '/static/wagtail_dottedimage/js/admin.js',
    ]

    js_includes = '\n'.join(['<script type="text/javascript" src="%s"></script>' % filename for filename in js])

    return js_includes


@hooks.register('insert_editor_css')
def dottedimage_css():
    css = [
        '/static/wagtail_dottedimage/css/admin.css',
    ]

    css_includes = '\n'.join(['<link type="text/css" rel="stylesheet" href="%s">' % filename for filename in css])

    return css_includes
