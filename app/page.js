"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useEffect } from "react";
import Header from "./dashboard/_components/Header";
import { ArrowBigLeft, ArrowBigRightIcon, AtomIcon, Download, Edit, LinkedinIcon, Share } from 'lucide-react'
import Link from "next/link";

export default function Home() {
  const {user,isSignedIn}=useUser();
  
  useEffect(()=>{
    user&&Checkuser();
  },[user])
  const createUser=useMutation(api.user.createUser);
  const Checkuser=async()=>{
    const result=await createUser({
      email:user?.primaryEmailAddress?.emailAddress,
      imageUrl:user?.imageUrl,
      userName:user?.fullName
    });
    console.log(result);

  }
  return (
    <div>
    <div className='p-3 px-5 justify-between flex shadow-md'>
        <img src='/logo.svg' width={100} height={100}/>
        {isSignedIn ? 
        <div className='flex gap-2 items-center'>
          <Link href={'/dashboard'}>
          <Button>Dashboard</Button>
          </Link>

          <UserButton/>
        </div> :
        <Link href={'/auth/sign-in'}>
            <Button>Get Started</Button>
        </Link>
        }
    </div>
  
    <div className='p-3 my-4'>
      {/* Featured Section */}
     <header className='text-4xl text-center font-bold'>Simplify PDF Note-Taking  <span className='text-blue-600'> With AI Powerd</span></header>
     <p className='text-gray-400 text-2xl text-center p-2'>Effortlessely Craft a Standout Notes With Our AI-powered </p>
     </div>
    <div className="p-5 mt-6">
    <section className="py-8 bg-white z-50 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
<h2 className="font-bold text-3xl">How it Works?</h2>
<h2 className="text-md text-gray-500">Give mock interview in just 3 simplar easy step</h2>

<div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <a
        className="block rounded-xl border bg-white
         border-gray-200 p-8 shadow-xl transition
         hover:border-pink-500/10 hover:shadow-pink-500/10"
        href="#"
      >
       <AtomIcon className='h-8 w-8'/>

        <h2 className="mt-4 text-xl font-bold text-black">Write promot for your form</h2>

        <p className="mt-1 text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex ut quo possimus adipisci
          distinctio alias voluptatum blanditiis laudantium.
        </p>
      </a>

      <a
        className="block rounded-xl border bg-white border-gray-200 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
        href="#"
      >
      <Edit className='h-8 w-8'/>

        <h2 className="mt-4 text-xl font-bold text-black">Edit Your form </h2>

        <p className="mt-1 text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex ut quo possimus adipisci
          distinctio alias voluptatum blanditiis laudantium.
        </p>
      </a>

      <a
        className="block rounded-xl border bg-white border-gray-200 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
        href="#"
      >
      <Share className='h-8 w-8' />

        <h2 className="mt-4 text-xl font-bold text-black">Share & Start Accepting Responses</h2>

        <p className="mt-1 text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex ut quo possimus adipisci
          distinctio alias voluptatum blanditiis laudantium.
        </p>
      </a>

    
    </div>

    <div className="mt-12 text-center">
      <a
        href="/sign-in"
        className="inline-block rounded bg-pink-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-yellow-400"
      >
        Get Started Today
      </a>
    </div>
    </section>

      
    </div>
    </div>
    
    
    
  );
}
