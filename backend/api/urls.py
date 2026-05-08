from django.urls import path
from . import views

urlpatterns = [
    path('chat/',      views.chat,       name='chat'),
    path('lifecycle/', views.lifecycle,  name='lifecycle'),
    path('greenwash/',    views.greenwash,    name='greenwash'),
    path('greenwash-ai/', views.greenwash_ai, name='greenwash_ai'),
    path('cars/',      views.cars_list,  name='cars'),
    path('grids/',     views.grids_list, name='grids'),
    path('health/',       views.health,             name='health'),
    path('data-sources/', views.data_sources_view,  name='data_sources'),
]
