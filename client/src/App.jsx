import SearchComponent from './searchComponent.jsx';
import { Route, Routes, useMatch } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext.jsx'; // Import the context provider
import Home from './pages/student/Home';
import CoursesList from './pages/student/CoursesList';
import CouseDetails from './pages/student/CouseDetails';
import MyEnrollments from './pages/student/MyEnrollments';
import Player from './pages/student/Player';
import Loading from './components/student/Loading';
import Educator from './pages/educator/Educator';
import Dashboard from './pages/educator/Dashboard';
import AddCourse from './pages/educator/AddCourse';
import MyCourses from './pages/educator/MyCourses';
import StudentsEnrolled from './pages/educator/StudentsEnrolled';
import Navbar from './components/student/Navbar';
import "quill/dist/quill.snow.css";
import { ToastContainer } from 'react-toastify';

const App = () => {
  const isEducatorRoute = useMatch('/educator/*');

  return (
    <AppContextProvider> {/* Wrap everything inside the provider */}
      <div className='text-default min-h-screen bg-white'>
        <ToastContainer />
        {!isEducatorRoute && <Navbar />}

        <Routes>
  <Route path='/' element={<Home />} />
  <Route path='/course-list' element={<CoursesList />} />
  <Route path='/course-list/:input' element={<CoursesList />} />
  <Route path='/course/:id' element={<CouseDetails />} />
  <Route path='/my-enrollments' element={<MyEnrollments />} />
  <Route path='/player/:courseID' element={<Player />} />
  <Route path='/loading/:path' element={<Loading />} />
  <Route path='/search' element={<SearchComponent />} />
  
  <Route path='/educator' element={<Educator />}>
    <Route path='/educator' element={<Dashboard />} />
    <Route path='add-course' element={<AddCourse />} />
    <Route path='my-course' element={<MyCourses />} />
    <Route path='student-enrolled' element={<StudentsEnrolled />} />
  </Route>
</Routes>

      </div>
    </AppContextProvider>
  );
};

export default App;

