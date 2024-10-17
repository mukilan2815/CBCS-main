import React, { useEffect, useState } from "react";
import axios from "axios";
import { headers } from "next/headers";
import toast from "react-hot-toast";

const UploadForm = () => {
  const [semester, setSemester] = useState("");
  const [totalSem,setTotalSem] = useState(8)
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [courseCredit, setCourseCredit] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState("");
  const [course, setCourse] = useState([]);
  const [programs, setPrograms] = useState([]);
  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/courses/",
        {
          headers: {
            Authorization: `token ${token}`
          }
        }
      )
      setCourse(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("There was an error fetching the courses!", error);
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/programs/", { headers: { Authorization: `Token ${token}` } })
      setPrograms(response.data);
    } catch (error) {
      console.error("There was an error fetching the programs!", error);
    }
  }

  const getBack = async () =>{
    try{
      const response = await axios.get("http://127.0.0.1:8000/adminDash/",{
        headers:{
          Authorization: `Token ${token}`
        }
      })
      console.log(response.data);
      setPrograms(response.data)
    }catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    getBack();
  }, [])

  const handleSubmit = async () => {
    setErrorMessage(""); // Clear any previous error message
    if (!semester || !subjectName || !subjectCode) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const semesterNumber = Number(semester);
    if (isNaN(semesterNumber) || semesterNumber <= 0) {
      setErrorMessage("Semester must be a positive number.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/courses/",
        {
          course_id: 1,
          semester,
          name: subjectName,
          code: subjectCode,
          program: program,
          courseCredit:courseCredit,
          is_optional: isOptional,
        },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      setSemester("");
      setSubjectName("");
      setSubjectCode("");
      setIsOptional(false);
      setLoading(false);
      setCourseCredit(0);
      if (response.statusText==="Created"){
        toast.success("Created",{position:"top-right"})
      }else{
        toast.error("Not Created")
      }
    } catch (error) {
      console.error("There was an error updating the course!", error);
      setErrorMessage(
        "There was an error updating the course. Please try again."
      );
      setLoading(false); // Stop loading in case of error
    }
  };

  return (
    <>
      <div className="max-w-lg mx-auto text-black bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Upload Course</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Program:
            </label>
            <select
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                const sp = programs.find(p => p.id == e.target.value);
                setTotalSem(sp.duration);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="" disabled>Select a program</option>
              {(programs.map(program => (
                <option value={program.id} key={program.id}>{program.name}</option>
              )))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Semester:
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="" disabled>Select Semester</option>
              {([1,2,3,4,5,6,7,8].slice(0,totalSem*2).map(sem => (
                <option value={sem} key={sem}>{sem}</option>
              )))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Subject Name:
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Subject Code:
            </label>
            <input
              type="text"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Course Credit:
            </label>
            <input
              type="number"
              value={courseCredit}
              onChange={(e) => setCourseCredit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          {/* <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Optional:
            </label>
            <input
              type="checkbox"
              checked={isOptional}
              onChange={(e) => setIsOptional(e.target.checked)}
              className="mr-2"
            />
            Is Optional
          </div> */}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {loading && <p>Loading...</p>}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default UploadForm;
