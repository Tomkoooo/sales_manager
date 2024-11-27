
'use client'
import React from 'react'
import { useUserContext } from '../context/useUser'
import Image from 'next/image';
import {Icon, IconLogout} from '@tabler/icons-react'
import Link from 'next/link'
import { IconHome, IconUser, IconSettings, IconShoppingBagCheck } from "@tabler/icons-react";

interface SidebarProps {
    title: string
    link: string
    icon: Icon
}

const Sidebar = ({ items }: { items?: SidebarProps[] }) => {
    const { user } = useUserContext();
    const defaultItems = [
        { title: 'Kezdőlap', link: '/', icon: IconHome },
        { title: 'Profil', link: '/profile', icon: IconUser },
        { title: 'Beállítás', link: '/settings', icon: IconSettings },
        { title: 'Eladás', link: '/sell', icon: IconShoppingBagCheck }
    ];

    const sidebarItems = items || user ? defaultItems : defaultItems.slice(0, 1);
    const getRandomAvatar = () => {
        if (user && user.sex !== 'male') {
            return 'https://avatar.iran.liara.run/public/girl'
        } else {
            return 'https://avatar.iran.liara.run/public/boy'
    }}

    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

  return (
    <div className='fixed bottom-0 w-full lg:static z-[999] lg:w-64 lg:min-h-[100dvh] flex flex-col shadow-md' style={{ boxShadow: 'rgb(171 161 161 / 30%) 15px 3px 5px -5px', backgroundColor: '#d9b99b'}}>
        <div className='w-full h-32 p-4 md:flex justify-between items-center hidden '>
            <div className='w-16 h-16 bg-white rounded-full'>
                <Image
                    src={user?.profilePicture ? `data:${user.profilePicture.type};base64,${user.profilePicture.data}` : getRandomAvatar()}
                    alt='avatar'
                    width={64}
                    height={64}
                    className='rounded-full'
                />
            </div>
            <div className='flex flex-col justify-center items-start'>
                <h1 className='text-xl font-bold'>{user?.username}</h1>
                <p className='text-sm'>{user?.email}</p>
            </div>
            
        </div>
        <div className='lg:w-full h-full flex flex-wrap lg:flex-col items-center gap-3 px-5'>
        {sidebarItems.map((item, index) => (
                <React.Fragment key={index}>
                    {item.title === 'Eladás' ? (
                        <Link href={item.link} className='btn lg:w-full w-14 flex justify-center lg:justify-start my-auto items-center'>
                            <span className='flex items-center gap-2'>
                                <item.icon />
                            </span>
                            <span className='lg:flex hidden'>{item.title}</span>
                        </Link>
                    ) : (
                        <Link href={item.link} className='btn lg:w-full w-14 btn-outline flex justify-center lg:justify-start items-center'>
                            <span className='flex items-center gap-2'>
                                <item.icon />
                            </span>
                            <span className='lg:flex hidden'>{item.title}</span>
                        </Link>
                    )}
                </React.Fragment>
            ))}
            <div className='flex lg:w-full w-16 lh:mt-auto p-4'>
                <button className='btn btn-error items-center w-14 lg:w-32 justify-center flex text-white' onClick={()=>(logout())}>
                    <IconLogout/>
                </button>
            </div>
        </div>
        
    </div>
  )
}

export default Sidebar