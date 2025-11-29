import { Button, Navbar, NavbarCollapse, NavbarLink, NavbarToggle, TextInput } from 'flowbite-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon } from "react-icons/fa";
const Header = () => {
  const path = useLocation().pathname;
  return (
    <>

      <Navbar className='border-b-2 border-gray-200 '>
        <Link to="/" className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'>
          <span className='px-2 py-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500  rounded-lg text-white'>TechStack</span>
          Blog
        </Link>
        <form>
          <TextInput
            type='text'
            placeholder='Search...'
            rightIcon={AiOutlineSearch}
            className='hidden lg:inline'
          />
        </form>
        <Button className='w-12 h-10 lg:hidden' pill color='alternative'>
          <span className="text-2xl text-gray-500">
            <AiOutlineSearch />
          </span>
        </Button>
        <div className='flex gap-2 md:order-2'>
          <Button className='w-12 h-10 hidden sm:inline' pill color='alternative'>
            <FaMoon />
          </Button>
          <Link to='/sign-in'>
            <Button className="relative rounded-lg p-0.5 bg-linear-to-r from-purple-500 to-blue-500 hover:cursor-pointer">
              <span className="block bg-white rounded-md px-5 py-2 text-purple-600 font-semibold">
                Sign In
              </span>
            </Button>
          </Link>
          <NavbarToggle />
        </div>
        <NavbarCollapse>
          <NavbarLink active={path === "/"} as={'div'}>
            <Link to='/'>Home</Link>
          </NavbarLink>
          <NavbarLink active={path === "/about"} as={'div'}>
            <Link to='/about'>About</Link>
          </NavbarLink>
          <NavbarLink active={path === "/projects"} as={'div'}>
            <Link to='/projects'>Projects</Link>
          </NavbarLink>
        </NavbarCollapse>
      </Navbar>


    </>
  )
}

export default Header