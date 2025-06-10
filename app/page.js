"use client"
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useEffect } from "react";
import Header from "./dashboard/_components/Header";
import { ArrowBigLeft, ArrowBigRightIcon, AtomIcon, Download, Edit, LinkedinIcon, Share, Upload, MessageCircle, Sparkles, Shield, Star } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    {/* Modern Navigation Header */}
    <div className='backdrop-blur-md bg-white/70 border-b border-white/20 px-6 py-4 flex justify-between items-center sticky top-0 z-50'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
            <Sparkles className='w-5 h-5 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>AI PDF Assistant</h1>
          </div>
        </div>
        {isSignedIn ? 
        <div className='flex gap-3 items-center'>
          <Link href={'/dashboard'}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            Dashboard
          </Button>
          </Link>
          <UserButton/>
        </div> :
        <Link href={'/auth/sign-in'}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
              Get Started
            </Button>
        </Link>
        }
    </div>
  
  
    {/* Hero Section with Enhanced Modern Design */}
    <div className='px-6 py-20 max-w-7xl mx-auto'>
      <div className='text-center mb-16'>
        <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-700 mb-6 backdrop-blur-sm border border-blue-200/50'>
          <Sparkles className='w-4 h-4 mr-2' />
          AI-Powered Document Intelligence
        </div>
        
        <h1 className='text-6xl md:text-7xl font-bold leading-tight mb-6'>
          Transform Your PDFs Into <br/>
          <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse'> 
            Smart Conversations
          </span>
        </h1>
        
        <p className='text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed'>
          Experience the future of document analysis. Upload any PDF and engage with our advanced AI 
          to unlock instant insights, comprehensive summaries, and intelligent answers.
        </p>
        
        {/* Enhanced CTA Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
          {isSignedIn ? (
            <Link href={'/dashboard'}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-16 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-0">
                <Sparkles className='w-5 h-5 mr-2' />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href={'/auth/sign-in'}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-16 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-0">
                <Sparkles className='w-5 h-5 mr-2' />
                Start Free Trial
              </Button>
            </Link>
          )}
        </div>

        {/* Trust Indicators */}
        <div className='flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 mb-20'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span>99.9% Uptime</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Shield className='w-4 h-4' />
            <span>Enterprise Security</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Star className='w-4 h-4 text-yellow-500' />
            <span>10k+ Happy Users</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Modern How It Works Section */}
    <div className="px-6 py-20">
    <section className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-sm font-medium text-green-700 mb-6 backdrop-blur-sm border border-green-200/50'>
          <MessageCircle className='w-4 h-4 mr-2' />
          Simple 3-Step Process
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-6">How AI PDF Assistant Works</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get intelligent insights from your documents in just 3 simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <div className="group relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Upload className='h-10 w-10 text-white'/>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Your PDF</h3>
            <p className="text-gray-600 leading-relaxed">
              Simply drag and drop your PDF document or click to upload. Our AI will process and understand your content within seconds.
            </p>
            
            <div className="mt-6 flex items-center text-blue-600 font-medium">
              <span>Instant Processing</span>
              <ArrowBigRightIcon className='w-4 h-4 ml-2' />
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className='h-10 w-10 text-white'/>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ask Questions</h3>
            <p className="text-gray-600 leading-relaxed">
              Chat naturally with your document. Ask questions, request summaries, or get explanations about specific topics within your PDF.
            </p>
            
            <div className="mt-6 flex items-center text-green-600 font-medium">
              <span>Natural Language</span>
              <ArrowBigRightIcon className='w-4 h-4 ml-2' />
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:-translate-y-2">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Sparkles className='h-10 w-10 text-white' />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get AI Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive intelligent, contextual answers powered by advanced AI. Export your insights or continue the conversation for deeper understanding.
            </p>
            
            <div className="mt-6 flex items-center text-purple-600 font-medium">
              <span>Smart Analysis</span>
              <Sparkles className='w-4 h-4 ml-2' />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        {isSignedIn ? (
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-16 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
              <Sparkles className='w-5 h-5 mr-2' />
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/auth/sign-in">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-16 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
              <Sparkles className='w-5 h-5 mr-2' />
              Get Started Today
            </Button>
          </Link>
        )}
      </div>
    </section>


    </div>
    </div>
  );
}
