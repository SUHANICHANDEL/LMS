import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import{ useClerk, UserButton,useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {

    const {navigate, isEducator, backendUrl, setIsEducator, getToken} = useContext(AppContext)


    const location = useLocation();
    const isCourseListPage = location.pathname.includes('/course-list');

    const {openSignIn} = useClerk()
    const {user} = useUser();

    const becomeEducator = async ()=>{
        try{
            if(isEducator){
                navigate('/educator')
                return;
            }
            const token = await getToken()
            const { data} = await axios.get(backendUrl + '/api/educator/update-role',{
                headers:{Authorization: `Bearer ${token}`}})


        if(data.success){
            setIsEducator(true)
            toast.success(data.message)
        } else {
            toast.error(data.message)
        }

        } catch(error){
            toast.error(error.message)

        }
    }

    return (
        <>
            {/* Navbar */}
            <div className={`fixed top-0 left-0 w-full z-50 flex items-center px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-300 py-4 
                ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>



                {/* Logo */}
                <img onClick = {()=> navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer'/>

                {/* Centered Navigation Items */}
                <div className='ml-auto flex items-center gap-5 text-gray-700'>
                   {  user && <>
                    <button onClick={becomeEducator} className="hover:text-blue-600">{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
                    <span>|</span>
                    <Link to='/my-enrollments' className="hover:text-blue-600">My Enrollments</Link>
                    </>}
                    { user ? <UserButton/> : 


                        <button onClick={()=> openSignIn()}  className='bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700'>Create Account</button>}
                </div>
                {/* Hidden on Medium and Smaller Screens */}
                <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
                    {
                        user ? <UserButton/>
                        : <button onClick={()=> openSignIn() } ><img src={assets.user_icon} alt="" /></button>
                    }
                    {/* Add any mobile-specific elements here, like a hamburger menu */}
                </div>
            </div>

            {/* Add space below navbar */}
            <div className="h-16"></div>
        </>
    );
}

export default Navbar
