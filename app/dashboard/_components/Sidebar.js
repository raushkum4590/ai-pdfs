"use client"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Layout, Shield } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import UploadPdfDialog from './UploadPdfDialog'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function Sidebar() {
  const { user } = useUser();
  const path = usePathname();

  // Fetch user files based on user email
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  // Safely calculate progress
  const uploadedFilesCount = fileList?.length || 0; // Fallback to 0 if undefined
  const progressValue = (uploadedFilesCount / 10) * 100;

  return (
    <div className='shadow-md h-screen p-7'>
      <Image src={'/logo.svg'} alt='logo' width={170} height={120} />
      <div className='mt-10'>
        <UploadPdfDialog isMaxFile={uploadedFilesCount >= 10}>
          <Button className='w-full'> + Upload PDF</Button>
        </UploadPdfDialog>
         <Link href={'/dashboard'}>
        <div
          className={`flex gap-2 items-center p-3 mt-5 hover:bg-slate-100 rounded-lg cursor-pointer ${
            path === '/dashboard' ? 'bg-slate-400' : ''
          }`}
        >
          <Layout />
          <h2>Workspace</h2>
        </div>
        </Link>
        <Link href={'/dashboard/upgrade'}>
        <div
          className={`flex gap-2 items-center p-3 mt-1 hover:bg-slate-100 rounded-lg cursor-pointer ${
            path === '/dashboard/upgrade' ? 'bg-slate-400' : ''
          }`}
        >
          <Shield />
          <h2>Upgrade</h2>
        </div>
        </Link>
      </div>
      <div className='absolute bottom-24 w-[80%]'>
        {/* Safely display progress */}
        <Progress value={progressValue} />
        <p className='text-sm mt-1'>{uploadedFilesCount} out of 10 PDFs Uploaded</p>
        <p className='text-xs text-gray-400 mt-2'>Upgrade to Upload more PDFs</p>
      </div>
    </div>
  );
}

export default Sidebar;
