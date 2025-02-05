import { useStoreActions, useStoreState } from "../store/hooks";
import { useEffect, useState } from "react";
import Document from "../components/Document";
import HorisontalNavbar from "../components/HorisontalNavbar";
import ModalPortal from "../components/ModalPortal";
import StudentVerticalNavbar from "../components/StudentVerticalNavbar";
import AttachFileIcon from "../icons/AttachFileIcon";
import DocumentIcon from "../icons/documentIcon";
import Select from "react-select";
import { useRouter } from "next/router";
const TeamDocs = ({toastsRef})=>{
    const router = useRouter()
    const [newDocModal,setNewDocModal] = useState(false)
    const [description,setDescription] = useState('');
    const [file,setFile] = useState(null);
    const [selectedFiles,setSelectedFiles] = useState({})
    const {createTeamDocument,getTeamDocuments,deleteTeamDocs,getPromotionDocumentTypes,commitDocs} = useStoreActions(store=>store.teamDocumentModel)
    const {documents,documentTypes} = useStoreState(store=>store.teamDocumentModel)
    const [chosenDocType,setChosenDocType] = useState(null)
   
    const  {uploadFileThunk} = useStoreActions(store=>store.user)
    const [openCommitModal,setOpenCommitModel] = useState(false)
    const [commitTitle,setCommitTitle] = useState('')
    const [commitDescription,setCommitDescription] = useState('')
    useEffect(async()=>{
        try{

            await getTeamDocuments();
            await getPromotionDocumentTypes();

        }catch(err){
            console.log(err)
            toastsRef.current.addMessage({text:"Probleme",mode:'Error'})

        }
    },[])
    const handleNewDoc = async e =>{
        e.preventDefault();
        try{
            if(!file ){
                toastsRef.current.addMessage({text:"inserez un fichier !!",mode:'Error'})
                return;
            }
            if(!chosenDocType){
                toastsRef.current.addMessage({text:"selectionez le type de document",mode:'Error'})
                return;
            }


           
            const formData = new FormData()
            formData.append("file",file)
            const res = await uploadFileThunk(formData)
            const {filename,destination,originalname} = res.data;
            console.log(res.data)
            const url = destination+'/'+filename;
            await createTeamDocument({name:originalname,url,description,typeDocId:chosenDocType.value})
            toastsRef.current.addMessage({text:"document ajouté avec success",mode:'Alert'})
            setDescription('')
            setFile(null)
            setNewDocModal(false)
         

               await getTeamDocuments()
           

            

        }catch(err){
            toastsRef.current.addMessage({text:"Probleme",mode:'Error'})
            console.log(err)
        }



    }
    const handleDeleteDocs = async e=>{
        e.preventDefault();
        try{
            await deleteTeamDocs({
                docsIds:Object.keys(selectedFiles)
            })
            toastsRef.current.addMessage({text:"document(s) supprimés",mode:'Alert'})
            setSelectedFiles({})
         
                await getTeamDocuments()
         


        }catch(err){
            console.log(err)
            toastsRef.current.addMessage({text:"Probleme",mode:'Error'})
        }
       

    }
    const handleCommitDocs = async e=>{
        e.preventDefault();
        try{
            await commitDocs({
                title:commitTitle,
                description:commitDescription,
                docsIds:Object.keys(selectedFiles)
            })
            toastsRef.current.addMessage({text:"c'est fait",mode:'Alert'})
            setOpenCommitModel(false)
        }catch(err){
            console.log(err)
            toastsRef.current.addMessage({text:"ops ... erreur",mode:'Error'})
            setOpenCommitModel(false)
        }
    }
    function handleChange(e) {
        setFile(e.target.files[0])
      };
    const handleSelectFiles = file=>{
        if(selectedFiles[file.id]){
            setSelectedFiles(files=>{
                const newFiles = {...files}
                delete newFiles[file.id]
                return newFiles;
            })
        }else{

            setSelectedFiles(files=>{
                return{...files,[file.id]:file}
            })
        }
       
    }
    return(
<div className="bg-background min-h-screen w-screen">
       <div className="pt-[100px] pl-[100px] h-full w-full">
       <div  className="h-[80vh]   flex lg:flex-row flex-col-reverse    text-[#1A2562]  font-xyz mt-[120px]    bg-white shadow-lg p-4 mx-[50px] ">
         <div className="lg:w-[80%] w-full h-full flex flex-col ">
                <div 
                className="w-full h-full   grid  grid-cols-[repeat(auto-fit,minmax(100px,_1fr))] gap-[20px] px-4 py-4 justify-items-center  items-center overflow-y-auto"> {/*The team docs lays here */}
                     { 
                            documents.map(doc=>{
                                return (
                                 
                                       <div 
                                         className="relative w-[100px] h-[100px] flex flex-col   cursor-pointer "
                                         onClick={(e)=>handleSelectFiles(doc)}
                                   >
                                       <div className={`absolute bottom-[40px] right-[40px] w-[15px] h-[15px] rounded-full ${selectedFiles[doc.id]?'bg-blue-400':'bg-blue-200'}  border-2`}></div>
                                   <div 
                                     className=" bg-gray-100 flex justify-center items-center p-4 w-fit"
                                   >
                                      
                                      <DocumentIcon
                                          className='w-8'
                                      />
                                      
                                  </div>
                                  <div className="w-full   break-words text-sm">{doc.name}</div>
                              </div>
                                )
                            })
                      }
                </div>
                <div className="flex w-[95%] justify-between h-[60px] bg-white   shadow-lg mx-auto"> {/* options menu */}
                            <div 
                                    className="h-full border-2 border-gray-200 w-1/4 justify-center flex items-center cursor-pointer"
                                    onClick={(e)=>setNewDocModal(m=>!m)}
                            >
                                        New
                            </div>
                           { Object.keys(selectedFiles).length ===1  &&<div 
                                    className="h-full border-2 border-gray-200 w-1/4 justify-center flex items-center cursor-pointer"
                            >
                                        Edit
                            </div>}
                          {  Object.keys(selectedFiles).length >=1 &&<div 
                                    className="h-full border-2 border-gray-200 w-1/4 justify-center flex items-center cursor-pointer"
                                    onClick={handleDeleteDocs}
                            >
                                        Delete
                            </div>}
                           { Object.keys(selectedFiles).length >=1 &&<div 
                                    className="h-full border-2 border-gray-200 w-1/4 justify-center flex items-center cursor-pointer"
                                    onClick = {()=>setOpenCommitModel(c=>!c)}
                            >
                                        Commit
                            </div>}
                       
                </div>
          </div>
          <div className=" lg:w-[20%] overflow-auto w-full lg:h-full h-[20%] flex flex-col shadow-lg px-2"> {/*document information */}
                {
                    <>
                        
                       { Object.keys(selectedFiles).length=== 1 &&(
                           <>
                            <div className="w-full  text-center font-medium text-xl">Document Infos:</div>
                            <div className="text-textcolor/90 "><span className="">Name: </span><span className="text-sm">{selectedFiles[Object.keys(selectedFiles)[0]].name}</span></div>
                            <div>Type: <span className="text-sm">{ selectedFiles[Object.keys(selectedFiles)[0]].type.name}</span></div>
                            <div  onClick={()=>router.push('http://localhost:8080/'+selectedFiles[Object.keys(selectedFiles)[0]].url?.slice(2))}  className="text-textcolor/90 cursor-pointer hover:underline">Url: <span className="text-sm">{selectedFiles[Object.keys(selectedFiles)[0]].url}</span> </div>
                            <div  className="text-textcolor/90">Owner: </div>
                            <div className="flex w-full flex-col pl-5 text-textcolor/90">
                            <div>Name: <span className="text-sm">{selectedFiles[Object.keys(selectedFiles)[0]].owner.firstName+' '+selectedFiles[Object.keys(selectedFiles)[0]].owner.lastName}</span></div>
                           
                            
                           
                           
                           
                            </div>
                            <div  className="text-textcolor/90">Description: </div>
                            <div className="w-full py-1 px-2 text-textcolor/90 bg-gray-200/30 text-justify backdrop-blur-md break-words">
                                {selectedFiles[Object.keys(selectedFiles)[0]].description}
                            </div>
                           
                           </>
                        )}
                    </>
                }
                
          </div>
            
        </div>
        <ModalPortal
            handleClose={setNewDocModal}
            open={newDocModal}
            styles = ''
        >
            
            <form className="w-full h-full flex flex-col items-center space-y-4" onSubmit={handleNewDoc}>
                <h1 className=" text-2xl text-textcolor font-semibold">Nouveau fichier</h1>
                <div className="w-[90%] text-center text-sm">Inserer un nouveau fichier dans l'espace de travail de votre equipe</div>
                  <div className="flex space-x-2 items-center mx-auto">
                          <div>Type:</div>
                            <Select
                                        placeholder="type de document..." 
                                        onChange={(option)=>{setChosenDocType(option)}}
                                        options={documentTypes.map(el=>{return {value:el.id,label:el.name}})}
                                        isLoading = {!documentTypes}
                                        value={chosenDocType}
                                        styles = {{menuPortal:base=>({...base,zIndex:100,width:'100px',height:'30px',borderRadius:'5px',color:'black',outline:'none'})}}
                                        
                            />
                    </div>
               { 
                        file?(
                            <>


                                <Document
                                    file = {file}
                                    for = 'modalFile'
                                />
                                <input id="modalFile" className="hidden" type="file"  onChange={handleChange} optional/>
                            </>
                         ):(
                             <>
                                <label for='file'  className="flex space-x-2 group cursor-pointer">
                                    <AttachFileIcon className='w-6 text-[#5375E2]/80 group-hover:text-[#5375E2]/60'/>
                                    <div> choisir un fichier</div>
                                </label>
                            
                                <input id="file" className="hidden" type="file"  onChange={handleChange} optional/>
                             </>
                         )

                        
               }
                <textarea 
                        value={description}
                        onChange={(e)=>setDescription(e.target.value)}
                        className='shadow-lg  placeholder-black rounded-[5px] px-2 text-black p-1 h-[60px] resize-none scroll-none w-[90%] bg-gray-200'
                        placeholder="description..."
                        
                />

               <button 
                    type="submit"  
                    className="bg-[#5375E2]/80 backdrop-blur-[8px]   font-semibold  px-4 border-2 border-white hover:bg-[#5375E2]/60 rounded-full text-white ease-in transition-colors tracking-wider">
                        
                            Submit
                    </button>
            </form>
        </ModalPortal>
        <ModalPortal
            open={openCommitModal}
            handleClose ={setOpenCommitModel}
        >
            <form className="flex flex-col w-[400px] items-center space-y-4 text-textcolor">
            <h1 className=" text-2xl text-textcolor font-semibold">Commit</h1>
                <div className="w-[90%] text-center text-sm">{Object.keys(selectedFiles).length} fichier selectionnés</div>
                <div className="flex space-x-2 w-[90%]">
                    <div>Title:</div>
                    <input 
                        placeholder="title..."
                        className="w-full bg-blue-50 backdrop-blur-sm rounded-[10px] px-2"
                        value={commitTitle}
                        onChange={(e)=>setCommitTitle(e.target.value)}
                    />
                   

                </div>
                <div className="flex  flex-col space-y-1  w-[90%]">
                    <div>Description:</div>
                    <textarea 
                   
                       
                        className='   p-1 h-[60px] resize-none scroll-none w-[90%] bg-blue-50 backdrop-blur-sm rounded-[5px]'
                        placeholder="description..."
                        value={commitDescription}
                        onChange={(e)=>setCommitDescription(e.target.value)}
                        
                />
                   

                </div>
                <div className="flex  space-x-2  w-[90%] justify-center">
                    <button className="font-medium text-black/70 transition-all ease-in bg-blue-300 hover:bg-blue-200 backdrop-blur-sm px-2 py-1 rounded-[5px]" onClick = {()=>setOpenCommitModel(false)}>Annuler</button>
                    <button 
                        className="font-medium text-black/70 transition-all ease-in bg-blue-300 hover:bg-blue-200 backdrop-blur-sm px-2 py-1 rounded-[5px]"
                        onClick={handleCommitDocs}
                    
                    >Envoyer</button>
                   

                </div>
               
            </form>
        </ModalPortal>
        
       </div>
</div>
    )
}


export default TeamDocs;