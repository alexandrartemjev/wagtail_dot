from wagtail.core.models import Page
from wagtail.search import index
from django.db import models
from wagtail.documents.models import AbstractDocument
from wagtail.admin.edit_handlers import StreamFieldPanel
from wagtail.core import blocks
from wagtail.core.fields import StreamField
from wagtail.documents.models import Document
from wagtail.documents.blocks import DocumentChooserBlock
from wagtail.images.models import Image
from wagtail.snippets.models import register_snippet
from wagtail.snippets.blocks import SnippetChooserBlock
from django.db import models
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.search import index
from wagtail_dottedimage.blocks import DottedBannerBlock

class HomePage(Page):
    pass


class SearchMixin(index.Indexed):
    @property
    def specific(self):
        return self

    class Meta:
        abstract = True


class City(models.Model):
    name = models.CharField(u'Город', max_length=50)
    i18n_name = models.CharField(u'Перевод', max_length=50, blank=True, null=True)
    region = models.CharField(u'Регион', max_length=50)


    class Meta:
        verbose_name = u'город'
        verbose_name_plural = u'Города'
        ordering = ['-i18n_name', 'name']

    def __str__(self):
        return self.get_name()

    def get_name(self):
        return self.name


###########################################################
# Metro
@register_snippet
class Metro(SearchMixin, models.Model):
    COLORS = [
        ('#ED1B35', u'Красная (Сокольническая)'),
        ('#44B85C', u'Зеленая (Замоскворецкая)'),
        ('#0078BF', u'Синяя (Арбатско-Покровская)'),
        ('#19C1F3', u'Голубая (Филёвская)'),
        ('#894E35', u'Кольцевая'),
        ('#F58631', u'Рыжая (Калужско-Рижская)'),
        ('#8E479C', u'Фиолетовая (Таганско-Краснопресненская)'),
        ('#FFCB31', u'Желтая (Калининско-Солнцевская)'),
        ('#A1A2A3', u'Серая (Серпуховско-Тимирязевская)'),
        ('#B3D445', u'Салатовая (Люблинско-Дмитровская)'),
        ('#79CDCD', u'Бирюзовая (Каховская)'),
        ('#ACBFE1', u'Серо-голубой (Бутовская)'),
        ('#de942b', u'Оранжевая (Белорусско-Савёловский)'),
        ('#d23973', u'Красноватая (Курско-Рижский)'),
    ]
    title = models.CharField(u'Название', max_length=50)
    color = models.CharField(u'Цвет ветки', max_length=7,
                             choices=COLORS, default=COLORS[0][0])

    search_fields = [
        index.SearchField('title'),
    ]

    class Meta:
        verbose_name = u'метро'
        verbose_name_plural = u'Метро'
        ordering = ['title']

    def __str__(self):
        return self.title


class MetroMapDot(blocks.StructBlock):
    coords = blocks.CharBlock(label=u'Коорд.', default='50%,50%')
    metro = SnippetChooserBlock(Metro, label=u'Станция')


class MetroMapBlock(DottedBannerBlock):
    svg = DocumentChooserBlock(label=u'SVG', required=False)
    dots = blocks.ListBlock(MetroMapDot(), label=u'Точки')

    class Meta:
        label = u'Карта'


class MetroMap(models.Model):
    city = models.ForeignKey(City, models.CASCADE,
                             related_name='metro', verbose_name=u'Город')
    dots = StreamField([
        ('map', MetroMapBlock())
    ], blank=True, null=True, verbose_name=u'Карта и точки')

    panels = [
        FieldPanel('city'),
        StreamFieldPanel('dots'),
    ]

    class Meta:
        verbose_name = u'карта'
        verbose_name_plural = u'Карты метро'
        ordering = ['city']

    def __str__(self):
        return self.city.get_name()

    def get_map(self):
        # return self.dots[0].value.get('image')
        return self.dots[0].value.get('svg') or self.dots[0].value.get('image')

    def get_metro_stations(self):
        try:
            return [dot['metro'] for dot in self.dots[0].value['dots']]
        except IndexError:
            return list()


###########################################################
###########################################################
