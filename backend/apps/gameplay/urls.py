from django.urls import path

from .views import (
    ChildAnalysisView,
    ChildExportCSVView,
    GameSessionListCreateView,
    LinkChildView,
    MyChildCodeView,
    MyChildrenView,
    ParentSignupView,
)

urlpatterns = [
    path('sessions/', GameSessionListCreateView.as_view(), name='gameplay-sessions'),
    path('my-code/', MyChildCodeView.as_view(), name='gameplay-my-code'),
    path('link-child/', LinkChildView.as_view(), name='gameplay-link-child'),
    path('parent-signup/', ParentSignupView.as_view(), name='gameplay-parent-signup'),
    path('my-children/', MyChildrenView.as_view(), name='gameplay-my-children'),
    path('children/<int:child_id>/analysis/', ChildAnalysisView.as_view(), name='gameplay-analysis'),
    path('children/<int:child_id>/export/', ChildExportCSVView.as_view(), name='gameplay-export'),
]