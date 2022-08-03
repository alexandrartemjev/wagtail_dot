# -*- coding: utf-8 -*-
from wagtail.core import blocks
from wagtail.images.blocks import ImageChooserBlock

from django.utils.functional import cached_property


class BigImageChooserBlock(ImageChooserBlock):

    @cached_property
    def widget(self):
        from .widgets import BigAdminImageChooser
        return BigAdminImageChooser


class ImageDot(blocks.StructBlock):
    POSITIONS = [
        ('center', u'по центру'),
        ('left', u'слева'),
    ]
    coords = blocks.CharBlock(label=u'Коорд.', default='50%,50%')
    image = ImageChooserBlock(label=u'Картинка', required=False)
    title = blocks.CharBlock(label=u'Загол.', required=False)
    text = blocks.TextBlock(label=u'Текст', required=False)


class DottedBannerBlock(blocks.StructBlock):
    # image = AdminMetroMapBlock()
    image = BigImageChooserBlock()
    dots = blocks.ListBlock(ImageDot(), label=u'Точки')

    class Meta:
        icon = 'grip'
