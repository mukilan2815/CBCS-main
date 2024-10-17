import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import { ArrowBack, Print, Search } from "@mui/icons-material";

interface Student {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  department: {
    name: string;
  };
  enrolled_courses: Array<{
    id: number;
    course: {
      name: string;
      code: string;
      semester: string;
      is_optional: boolean;
    };
  }>;
}

const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/students/", {
        headers: { Authorization: `token ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students", error);
    }
  };

  const fetchIndividualStudent = async (sid: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/getdetails/${sid}/`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      setSelectedStudent(response.data["student"]);
    } catch (error) {
      console.error("Error fetching individual student", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleBackToList = () => setSelectedStudent(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter
      ? student.department.name === departmentFilter
      : true;

    return matchesSearchTerm && matchesDepartment;
  });

  return (
    <Box maxWidth="lg" margin="auto" padding={4}>
      <Typography
        variant="h4"
        gutterBottom
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Student List
      </Typography>

      <AnimatePresence mode="wait">
        {selectedStudent ? (
          <motion.div
            key="student-details"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <img
                    src="https://kahedu.edu.in/n/wp-content/uploads/2020/01/KAHE-logo-2.png"
                    alt="Karpagam Academy Logo"
                    style={{ height: 60, marginRight: 16 }}
                  />
                  <Box>
                    <Typography variant="h6" color="primary">
                      KARPAGAM ACADEMY OF HIGHER EDUCATION
                    </Typography>
                    <Typography variant="caption">
                      (Deemed to be University)
                    </Typography>
                    <Typography variant="caption" display="block">
                      [Established Under Section 3 of UGC Act, 1956]
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" gutterBottom>
                  Pollachi Main Road, Eachanari Post, Coimbatore - 641 021,
                  Tamil Nadu, India.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Phone: 0422 - 2980011- 14 | Fax : 0422 - 2980022 | Email :
                  info@kahedu.edu.in
                </Typography>

                <Typography variant="body2" align="right" gutterBottom>
                  {new Date().toLocaleDateString()}
                </Typography>

                <Typography variant="h6" gutterBottom>
                  Student Details
                </Typography>

                <Box marginBottom={2}>
                  <Typography>
                    <strong>Register No:</strong> {selectedStudent.username}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedStudent.email}
                  </Typography>
                  <Typography>
                    <strong>Department:</strong>{" "}
                    {selectedStudent.department.name}
                  </Typography>
                  {selectedStudent.phone && (
                    <Typography>
                      <strong>Phone:</strong> {selectedStudent.phone}
                    </Typography>
                  )}
                  {selectedStudent.address && (
                    <Typography>
                      <strong>Address:</strong> {selectedStudent.address}
                    </Typography>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Enrolled Courses:
                </Typography>
                {selectedStudent.enrolled_courses &&
                selectedStudent.enrolled_courses.length > 0 ? (
                  <Box component="ul" paddingLeft={2}>
                    {selectedStudent.enrolled_courses.map((course) => (
                      <Box component="li" key={course.id} marginBottom={1}>
                        {course.course.name}
                        <Chip
                          size="small"
                          label={`Code: ${course.course.code}`}
                          style={{ marginLeft: 8 }}
                        />
                        <Chip
                          size="small"
                          label={`Semester: ${course.course.semester}`}
                          style={{ marginLeft: 8 }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography>No enrolled courses available.</Typography>
                )}

                <Box
                  display="flex"
                  justifyContent="space-between"
                  marginTop={2}
                >
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBackToList}
                    variant="contained"
                    color="secondary"
                  >
                    Back to List
                  </Button>
                  <Button
                    startIcon={<Print />}
                    onClick={() => window.print()}
                    variant="contained"
                    color="primary"
                  >
                    Print
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="student-list"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Box display="flex" marginBottom={2}>
              <TextField
                label="Search by Username or Email"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: <Search />,
                }}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as string)}
                displayEmpty
                variant="outlined"
                style={{ minWidth: 180, marginLeft: 16 }}
              >
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
              </Select>
            </Box>

            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Reg No.</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => fetchIndividualStudent(student.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default StudentsList;
