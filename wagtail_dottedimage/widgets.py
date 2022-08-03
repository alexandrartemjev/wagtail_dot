
import json

from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _

from wagtail.admin.widgets import AdminChooser
from wagtail.images.models import Image


class BigAdminImageChooser(AdminChooser):
    choose_one_text = _('Choose an image')
    choose_another_text = _('Выбрать другое изображение')
    link_to_chosen_text = _('Edit this image')

    class Media:
        js = [
            'wagtailimages/js/image-chooser-modal.js',
            'wagtailimages/js/image-chooser.js',
        ]

    def __init__(self, **kwargs):
        super(BigAdminImageChooser, self).__init__(**kwargs)
        self.image_model = Image

    def render_html(self, name, value, attrs):
        instance, value = self.get_instance_and_id(self.image_model, value)
        original_field_html = super(BigAdminImageChooser, self).render_html(name, value, attrs)

        return render_to_string("image_chooser.html", {
            'widget': self,
            'original_field_html': original_field_html,
            'attrs': attrs,
            'value': value,
            'image': instance,
        })

    def render_js_init(self, id_, name, value):
        return "createImageChooser({0});window.imageChoosers=window.imageChoosers||[];window.imageChoosers.push({0})".format(json.dumps(id_))

