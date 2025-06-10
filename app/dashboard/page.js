"use client"
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import { FileText, Clock, Eye, Sparkles, TrendingUp, Calendar, MoreVertical, Star, Upload } from 'lucide-react';

function Dashboard() {
  const { user } = useUser();

  // Fetch user files based on user email
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const fileDate = new Date(timestamp);
    const diffInHours = Math.floor((now - fileDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(timestamp);
  };
  return (
    <div className='min-h-screen'>
      {/* Enhanced Header Section */}
      <div className='mb-10'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3'>
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className='text-xl text-gray-600 font-medium'>
              Discover insights and unlock the power of your documents with AI
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-xl'>
              <div className='flex items-center space-x-4'>
                <div className='w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
                  <Sparkles className='w-7 h-7 text-white' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-600 mb-1'>AI Analyses Completed</p>
                  <p className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    {fileList?.length * 3 || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
        <div className='bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-8 shadow-xl border border-blue-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide'>Total Documents</p>
              <p className='text-4xl font-bold text-gray-900 mb-3'>{fileList?.length || 0}</p>
              <div className='flex items-center text-sm'>
                <div className='flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full'>
                  <TrendingUp className='w-4 h-4 mr-1' />
                  <span className='font-medium'>+12% this month</span>
                </div>
              </div>
            </div>
            <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl'>
              <FileText className='w-8 h-8 text-white' />
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-white to-green-50/50 rounded-3xl p-8 shadow-xl border border-green-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide'>Time Saved</p>
              <p className='text-4xl font-bold text-gray-900 mb-3'>{(fileList?.length || 0) * 2.5}h</p>
              <div className='flex items-center text-sm'>
                <div className='flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full'>
                  <Clock className='w-4 h-4 mr-1' />
                  <span className='font-medium'>AI-powered efficiency</span>
                </div>
              </div>
            </div>
            <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl'>
              <Clock className='w-8 h-8 text-white' />
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-white to-purple-50/50 rounded-3xl p-8 shadow-xl border border-purple-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide'>Success Rate</p>
              <p className='text-4xl font-bold text-gray-900 mb-3'>98%</p>
              <div className='flex items-center text-sm'>
                <div className='flex items-center text-purple-600 bg-purple-50 px-3 py-1 rounded-full'>
                  <Star className='w-4 h-4 mr-1' />
                  <span className='font-medium'>AI accuracy</span>
                </div>
              </div>
            </div>
            <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-2xl'>
              <Star className='w-8 h-8 text-white' />
            </div>
          </div>
        </div>
      </div>      {/* Documents Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
        {/* Main Documents Section */}
        <div className='lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20'>
          <div className='p-8 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent'>Your Documents</h2>
              <div className='flex items-center space-x-4'>
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-2xl'>
                  <span className='text-sm font-semibold text-blue-700'>{fileList?.length || 0} documents</span>
                </div>
              </div>
            </div>
          </div>          <div className='p-8'>
            {fileList && fileList.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {fileList.map((file, index) => (
                  <Link key={index} href={'/workspace/' + file.fileId}>
                    <div className='group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer'>
                      <div className='flex items-center space-x-4'>
                        {/* PDF Icon with glow effect */}
                        <div className='relative'>
                          <div className='w-14 h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-200 transition-shadow'>
                            <FileText className='w-7 h-7 text-white' />
                          </div>
                          <div className='absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                            <Sparkles className='w-2.5 h-2.5 text-white' />
                          </div>
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors'>
                            {file?.fileName}
                          </h3>
                          
                          <div className='flex items-center space-x-3 text-xs text-gray-500 mb-2'>
                            <div className='flex items-center space-x-1'>
                              <Calendar className='w-3 h-3' />
                              <span>{getTimeAgo(file._creationTime)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button className='px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors'>
                              Open
                            </button>
                            <button className='px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors'>
                              <MoreVertical className='w-3 h-3' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className='w-24 h-24 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <FileText className='w-12 h-12 text-gray-400' />
                </div>
                <h3 className='text-2xl font-semibold text-gray-900 mb-3'>No documents yet</h3>
                <p className='text-gray-600 mb-8 max-w-md mx-auto'>Upload your first PDF to get started with AI-powered document analysis and insights</p>
                <button className='px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105'>
                  <Upload className='w-5 h-5 mr-2 inline' />
                  Upload Your First PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights & Activity Panel */}
        <div className='space-y-8'>
          {/* Recent Activity */}
          <div className='bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-6 shadow-xl border border-blue-100/50 backdrop-blur-sm'>
            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center'>
                <Clock className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Recent Activity</h3>
            </div>
            
            <div className='space-y-4'>
              {fileList && fileList.length > 0 ? (
                fileList.slice(0, 3).map((file, index) => (
                  <div key={index} className='flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors'>
                    <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center'>
                      <FileText className='w-4 h-4 text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>{file.fileName}</p>
                      <p className='text-xs text-gray-500'>Uploaded {getTimeAgo(file._creationTime)}</p>
                    </div>
                    <div className='text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full'>
                      Processed
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-6'>
                  <p className='text-gray-500 text-sm'>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className='bg-gradient-to-br from-white to-purple-50/50 rounded-3xl p-6 shadow-xl border border-purple-100/50 backdrop-blur-sm'>
            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900'>AI Insights</h3>
            </div>
            
            <div className='space-y-4'>
              <div className='bg-white rounded-xl p-4 border border-purple-100'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold text-gray-900'>Processing Power</h4>
                  <div className='text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full'>
                    Active
                  </div>
                </div>
                <div className='text-2xl font-bold text-purple-600 mb-2'>{(fileList?.length || 0) * 156} tokens</div>
                <p className='text-sm text-gray-600'>Processed this month</p>
              </div>
              
              <div className='bg-white rounded-xl p-4 border border-blue-100'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold text-gray-900'>Smart Summaries</h4>
                  <div className='text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
                    Ready
                  </div>
                </div>
                <div className='text-2xl font-bold text-blue-600 mb-2'>{fileList?.length || 0}</div>
                <p className='text-sm text-gray-600'>Documents analyzed</p>
              </div>
              
              <div className='bg-white rounded-xl p-4 border border-green-100'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold text-gray-900'>Efficiency Gain</h4>
                  <div className='text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full'>
                    Optimized
                  </div>
                </div>
                <div className='text-2xl font-bold text-green-600 mb-2'>89%</div>
                <p className='text-sm text-gray-600'>Faster than manual review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
