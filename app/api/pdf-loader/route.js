import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";



//const pdfUrl = "https://trustworthy-eagle-317.convex.cloud/api/storage/1d78f8da-9e94-4942-bb99-65395830b253"
export async function GET (req) {
    const reqUrl=req.url;
    const {searchParams}=new URL(reqUrl);
    const pdfUrl=searchParams.get('pdfUrl');
    console.log(pdfUrl);
    const response=await fetch(pdfUrl);
    const data=await response.blob();
    const loader =new WebPDFLoader(data);

    const docs=await loader.load();

    let pdfTextContent='' ;
    docs.forEach(doc=>{
        pdfTextContent = pdfTextContent+doc.pageContent;
    }
    )

    //split the Text into small chunkes 
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
      });
      
const output = await splitter.createDocuments([pdfTextContent]);

let splitterList=[];
 output.forEach(doc=>{
    splitterList.push(doc.pageContent);

 })
    return NextResponse.json({result:splitterList})
}