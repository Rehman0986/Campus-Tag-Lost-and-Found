from rest_framework import serializers
from .models import FinderReport, FinderMessage

class FinderReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinderReport
        fields = '__all__'
        read_only_fields = ('id', 'status', 'ip_address', 'created_at')


class FinderMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinderMessage
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
