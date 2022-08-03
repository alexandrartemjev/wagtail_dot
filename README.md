# Wagtail Plugin


## Суть задачи

Необходимо проапгрейдить Wagtail до версии 2.13 и переписать плагин установки точек на изображении

Особенности обновления находятся по ссылке https://docs.wagtail.org/en/stable/releases/2.13.html раздел "StreamField performance and functionality updates"

Плагин находится в директории wagtail_dottedimage, переписать необходимо с использованием [telepath](https://wagtail.github.io/telepath/)  

Плагин можно переписать полностью, главное - основной функционал должен остаться неизменным



## Базовые команды

- Собрать:

        $ docker compose -f .\local.yml build

- Запустить:

        $ docker compose -f .\local.yml up

- Выполнить миграции:

        $ python manage.py migrate

- Создать пользователя:

        $ python manage.py createsuperuser

## Последовательность действий в CMS

- Авторизоваться в http://localhost:8000/admin
- Добавить город в http://localhost:8000/admin/home/city/create/
- Добавить станцию метро http://localhost:8000/admin/home/metro/create/
- Создать карту метро http://localhost:8000/admin/home/metromap/create/
  Указать город, Выбрать Image, в блоке Точки выбрать ранее созданное метро
  (плагин может не заработать с первого раза. Нужно нажать кнопку сохранить, после этого на изображении появятся точки)
