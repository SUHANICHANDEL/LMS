import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyCourses = () => {
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
  const [courses, setCourses] = useState([])
   
  const fetchEducatorCourses = async () => {
    console.log("Fetching courses..."); // Add this
    try {
      const token = await getToken()
      const { data } = await axios.get(
        backendUrl + '/api/educator/courses',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log(data) // Log what you receive
      data.success && setCourses(data.courses)
    } catch (error) {
      toast.error(error.message)
    }
  }
 
  useEffect(() => {
    if(isEducator){
    fetchEducatorCourses()
  }
  }, [isEducator]) // Added allCourses as dependency

  if (!courses.length) return <Loading />

  return (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border-gray-500/20'>
          <table className='md:table-auto table-fixed w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {courses.map((course) => (
                <tr key={course._id} className='border-b border-gray-500/20'>
                  <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                    <img src={course.courseThumbnail} alt="Course" className='w-16'/>
                    <span className='truncate hidden md:block'>
                      {course.courseTitle}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    {currency} {Math.floor((course.enrolledStudents?.length || 0) * (course.coursePrice - course.discount * course.coursePrice / 100))}
                  </td>
                  <td className='px-4 py-3'>{course.enrolledStudents?.length || 0}</td>
                  <td className='px-4 py-3'>{new Date(course.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MyCourses