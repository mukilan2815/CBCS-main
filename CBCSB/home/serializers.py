# serializers.py
from rest_framework import serializers
from .models import HOD, Student,Course,Department,Batch,Program,SemReport,CourseStatus

class HODSerializer(serializers.ModelSerializer):
    class Meta:
        model = HOD
        fields = ['id', 'username', 'password', 'email', 'department']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        hod = HOD.objects.create_user(**validated_data)
        return hod

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = "__all__"
        
class ProgramSerial(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = "__all__"
    
class CourseSerializer(serializers.ModelSerializer):
    # dont edit the program or add anything new to this , because it is working well 😑
    program = ProgramSerial()
    class Meta:
        model = Course
        fields = ['id', 'name', 'code',"courseCredit", 'is_optional', 'semester',"program"]

class CourseSerial(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'code',"courseCredit", 'is_optional', 'semester',"program"]

class CourseItemSerial(serializers.ModelSerializer):
    course = CourseSerializer()
    class Meta:
        model = CourseStatus
        fields = "__all__"
    
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id','name']

class StudentSerializer(serializers.ModelSerializer):
    # enrolled_courses = CourseSerializer(many=True)
    # department = DepartmentSerializer()
    class Meta:
        model = Student
        fields = ['id', 'username', 'password', 'email', 'department',"program","batch","sem","enrolled_courses"]
        extra_kwargs = {'password': {'write_only': True},"current_semester":{'read_only':True}, "enrolled_courses":{'read_only':True, 'required':False}}

    def create(self, validated_data):
        student = Student.objects.create_user(**validated_data)
        return student
    
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Replace the department ID with the serialized data
        representation['department'] = DepartmentSerializer(instance.department).data
        return representation

class LoginSerial(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
class ReportSerial(serializers.ModelSerializer):
    class Meta:
        model = SemReport
        fields = "__all__"
    
class StudentSendSerial(serializers.ModelSerializer):
    department = DepartmentSerializer()
    program = ProgramSerial()
    batch = BatchSerializer()
    enrolled_courses = CourseItemSerial(many=True)
    class Meta:
        model = Student
        fields = ['id', 'username', 'email', 'department',"program","batch","sem","enrolled_courses"]
