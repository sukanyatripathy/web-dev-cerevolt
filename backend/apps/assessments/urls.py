from django.urls import path
from .admin_views import (admin_child_detail, admin_children,
                          admin_export_csv, admin_overview)
from .views import (AssessmentHistoryView, AssessmentResultView,
                    MyChildrenView, StartAssessmentView, SubmitAssessmentView)

urlpatterns = [
    path("start/", StartAssessmentView.as_view()),
    path("children/", MyChildrenView.as_view()),
    path("history/", AssessmentHistoryView.as_view()),
    path("<int:pk>/submit/", SubmitAssessmentView.as_view()),
    path("<int:pk>/result/", AssessmentResultView.as_view()),
    path("admin/children/", admin_children),
    path("admin/children/<int:child_id>/", admin_child_detail),
    path("admin/overview/", admin_overview),
    path("admin/export/", admin_export_csv),
]