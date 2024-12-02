"use client"
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

function Dashboard() {
  const { user } = useUser();

  // Fetch user files based on user email
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  console.log(fileList);  // Check the fetched data in console

  return (
    <div>
      <div>
        <h2 className='font-medium text-3xl'>Workspace</h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-10'>
        {/* Check if fileList exists and map over it */}
        {fileList && fileList.length > 0 ? (
          fileList.map((file, index) => (
            <Link key={index} href={'/workspace/' + file.fileId}>
              <div className='flex p-5 shadow-md flex-col rounded-md items-center justify-center'>
                <Image src='/pdf.svg' alt='pdf' width={170} height={120} />
                <h2 className='ml-4 mt-3 font-medium text-lg'>{file?.fileName}</h2>
              </div>
            </Link>
          ))
        ) : (
          <p>No files available.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
