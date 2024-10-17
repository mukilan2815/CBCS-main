from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.contrib.auth import authenticate,login
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny,IsAuthenticated
from . import models, serializers,urls,utils

# Create your views here.

@api_view(["GET"])
def test(request):
    ip = str(utils.get_ip_address())
    cont = {}
    for i in range(len(urls.urlpatterns)):
        name = str(urls.urlpatterns[i].name).ljust(20).rjust(21," ")
        cont[name] = "http://"+ip + ":8000/"+urls.urlpatterns[i].pattern._route
    
    cont['Admin Login'.ljust(20).rjust(21," ")] = "http://localhost:8000/admin/"
    
    return Response({"cont":cont})

class Login(APIView):
    permission_classes = [AllowAny]
    serializer_class = serializers.LoginSerial

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            cont = {}
            if models.HOD.objects.filter(username=username).exists():
                cont['user_type'] = 'HOD'
            elif models.Student.objects.filter(username=username).exists():
                cont['user_type'] = 'Student'
            else:
                cont['user_type'] = 'Admin'
            
            token, created = Token.objects.get_or_create(user=user)
            cont['token'] = token.key
            cont['id'] = user.id
            cont['username'] = user.username
            return Response(cont, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

class HODRegisterView(generics.CreateAPIView):
    queryset = models.HOD.objects.all()
    serializer_class = serializers.HODSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if (models.HOD.objects.filter(username=request.user.username).exists() or models.Student.objects.filter(username=request.user.username).exists()):
            return Response({"error": "Only Admins can create a HOD."}, status=status.HTTP_403_FORBIDDEN)

        try:
            department_id = request.data.get('department') 
            department = get_object_or_404(models.Department, id=department_id)
            instance = serializer.save(department=department)
            return Response({
                "message": "Head of Department created successfully.",
                "id": instance.id,
                "username": instance.username,
                "department": instance.department.name
            }, status=status.HTTP_201_CREATED)
        except models.Department.DoesNotExist:
            return Response({"error": "Department does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request, *args, **kwargs):
        if not (models.HOD.objects.filter(username=request.user.username).exists() or models.Student.objects.filter(username=request.user.username).exists()):
            hods = models.HOD.objects.all()
            serial = self.get_serializer(hods, many=True)
            return Response(serial.data)
        else:
            return  Response("Only Admins Can View This Page",status=status.HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS)    

class StudentRegisterView(generics.CreateAPIView):
    queryset = models.Student.objects.all()
    serializer_class = serializers.StudentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not models.HOD.objects.filter(username=request.user.username).exists():
            return Response({"error": "You are not authorized to create a student."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dep_id = request.data.get('department')
            department = get_object_or_404(models.Department, id=dep_id)
            instance = serializer.save(department=department)
            return Response({
                "message": "Student created successfully.",
                "id": instance.id,
                "username": instance.username,
                "department": instance.department.name
            }, status=status.HTTP_201_CREATED) 
        except models.Department.DoesNotExist:
            return Response({"error": "Program does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getStudents(request):
    if request.method == "GET" and models.HOD.objects.filter(username=request.user.username).exists():
        hod = models.HOD.objects.get(username=request.user.username)
        students = models.Student.objects.all().filter(department=hod.department)
        serializer = serializers.StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        student = models.Student.objects.get(username=request.user.username)
        serial = serializers.StudentSerializer(student)
        return Response(serial.data)
    

class CourseView(generics.ListCreateAPIView):
    queryset = models.Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        if models.HOD.objects.filter(username=request.user.username).exists():
            course = serializers.CourseSerial(data=request.data)
            if course.is_valid():
                course.save(department=request.user.hod.department)
                return Response(course.data, status=status.HTTP_201_CREATED)
            return Response(course.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "You are not authorized to view courses."}, status=status.HTTP_403_FORBIDDEN)
        
    def get(self, request, *args, **kwargs):
        if models.HOD.objects.filter(username=request.user.username).exists():
            courses = models.Course.objects.filter(department=request.user.hod.department)
            return Response(serializers.CourseSerializer(courses, many=True).data)
        return Response({"error": "You are not authorized to view courses."}, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET',"POST"])
@permission_classes([IsAuthenticated])
def selectCourses(request,sem):
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        stud = models.Student.objects.get(username=request.user.username)
        studSerial = serializers.StudentSerializer(stud)
        enrolled_courses = serializers.CourseItemSerial(stud.enrolled_courses,many=True)
        avail_courses = serializers.CourseSerializer(models.Course.objects.filter(department=stud.department).filter(program = stud.program).filter(semester=sem),many=True)
        
        cont = {
            "student":studSerial.data,
            "enroled_courses":enrolled_courses.data,
            "avail_courses": avail_courses.data,
        }
        return Response(cont)
    
    if request.method == "POST" and models.Student.objects.filter(username=request.user.username).exists():
        courselist = request.data['CourseIDs']
        stud = models.Student.objects.get(username=request.user.username)
        studSerial = serializers.StudentSerializer(stud)
        semRep,created = models.SemReport.objects.get_or_create(student=stud,semester=stud.sem)
        errors = []
        
        for courseID in courselist:
            cours = models.Course.objects.get(pk=courseID)
            if not stud.enrolled_courses.filter(course=cours,status="Enrolled",semester=stud.sem).exists():
                coursItem = models.CourseStatus(course=cours,status="Enrolled",semester=stud.sem)
                coursItem.save()
                stud.enrolled_courses.add(coursItem)
                semRep.courses.add(coursItem)
                stud.save()
                semRep.save()
            else:
                errors.append(str(cours.name)+" Already Enrolled")
                
        semserial = serializers.ReportSerial(semRep)
        cont = {
            "report":semserial.data,
            "student":studSerial.data,
            "course-list":courselist,
            "error":errors
        }
        return Response(cont)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUpSemWithStudDetail(request):
    if request.method=="GET":
        student = models.Student.objects.get(username=request.user.username)
        studSerial = serializers.StudentSendSerial(student)
        semRep = models.SemReport.objects.filter(student=student)
        semSerial = serializers.ReportSerial(semRep,many=True)
        cont = {
            "student":studSerial.data,
            "sem":student.sem,
            "department":student.department.name,
            "program":student.program.name,
            "report":semSerial.data,
        }
        return Response(cont)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUpSemWithStudDetailHOD(request,sid):
    if request.method=="GET":
        student = models.Student.objects.get(pk=sid)
        studSerial = serializers.StudentSendSerial(student)
        semRep = models.SemReport.objects.filter(student=student)
        semSerial = serializers.ReportSerial(semRep,many=True)
        cont = {
            "student":studSerial.data,
            "sem":student.sem,
            "department":student.department.name,
            "program":student.program.name,
            "report":semSerial.data,
        }
        return Response(cont)
        
@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def getCourses(request):
    if request.method == "GET" and models.HOD.objects.filter(username=request.user.username).exists():
        hod = models.HOD.objects.get(username=request.user.username)
        courses = models.Course.objects.filter(department=hod.department)
        serial = serializers.CourseSerializer(courses,many=True)
        return Response(serial.data)
    
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        student = models.Student.objects.get(username=request.user.username)
        courses = models.Course.objects.filter(department=student.department,semester=student.sem)
        serial = serializers.CourseSerializer(courses,many=True)
        return Response(serial.data)
    
    if request.method == "POST" and models.Student.objects.filter(username=request.user.username).exists():
        student = models.Student.objects.get(username=request.user.username)
        ids = [x['id'] for x in request.data[0]]
        print(ids)
        for i in ids:
            course = models.Course.objects.get(pk=i)
            student.enrolled_courses.add(course)
        serial = serializers.StudentSerializer(student)
        print(serial.data)
        return Response("HI")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def programs(request):
    if request.method == "GET":
        programs = models.Program.objects.filter(department=request.user.hod.department)
        return Response(serializers.ProgramSerial(programs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adminDashBoard(request):
    if request.method == "GET":
        user = models.HOD.objects.get(username=request.user.username)
        programs = models.Program.objects.filter(department=user.department)
        pserial = serializers.ProgramSerial(programs,many=True)
        return Response(pserial.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def studDashBoard(request):
    if request.method == "GET":
        
        pass