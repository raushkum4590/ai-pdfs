"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Loader2Icon } from 'lucide-react'
import uuid4 from 'uuid4'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
  

function UploadPdfDialog({children,isMaxFile}) {

  const generateUploadUrl=useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntery =useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl =useMutation(api.fileStorage.getFileUrl);
  const embeddDocument = useAction(api.myActions.ingest)
  const {user}=useUser();
  const[file,setFile]=useState();
  const[loading,setLoading]=useState(false);
  const [fileName,setFileName]=useState();
  const [open,setOpen]=useState(false);
   const onfileselect=(event)=>{
    setFile(event.target.files[0]);


   } 
   const onUpload = async () => {
    try {
      setLoading(true);
  
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      console.log("storageId", storageId);
  
      const fileId = uuid4();
      const fileUrl = await getFileUrl({ storageId });
  
      const createdBy = user?.primaryEmailAddress?.emailAddress || "Anonymous";
      const resp = await addFileEntery({
        fileId,
        storageId,
        fileName: fileName || "Untitled File",
        fileUrl,
        createdBy,
      });
  
      console.log(resp);

      const ApiResp=await axios.get('/api/pdf-loader?pdfUrl='+fileUrl);
      console.log(ApiResp.data.result);
       await embeddDocument({
        splitText:ApiResp.data.result,
         fileId:fileId
      });
     // console.log(embeddResult);


      setOpen(false);
      setLoading(false);
    } catch (error) {
      console.error("Error during upload:", error);
      

      
      
      
      setLoading(false);
    

    }
  };
  
  return (
    <div>
        <Dialog open={open}>
  <DialogTrigger asChild>
    <Button onClick={()=>setOpen(true)} disabled={isMaxFile} className="w-full">+ Upload PDF File</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Upload Pdf File</DialogTitle>
      <DialogDescription asChild>
        <div>
        <h2 className='mt-5'>Select a file to Upload</h2>
            <div className=' gap-2 p-3 rounded-md border'>
              
                <input type="file" accept='application/pdf'
                onChange={(event)=>onfileselect(event)} />
            </div>
            <div className='mt-2'>
                <label> File Name *</label>
                <Input placeholder="File Name" onChange={(e)=>setFileName(e.target.value)} />
            </div>
        </div>
      </DialogDescription>
    </DialogHeader>
    
    <DialogFooter>
      <Button variant="secondary">Confirm</Button>
      <Button onClick={onUpload} disabled={loading}>
        {loading?
        <Loader2Icon className='animate-spin'/>:'Upload'
          }
        Upload</Button>
    </DialogFooter>
    
  </DialogContent>
</Dialog>

    </div>
  )
}

export default UploadPdfDialog