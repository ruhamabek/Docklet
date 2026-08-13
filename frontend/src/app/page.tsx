"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { GetDockerInfo, Greet, ListContainers, ListImages, PullImages, RemoveContainer, RemoveImage, StartContainer, StopContainer, StopContainerLogs, StreamContainerLogs } from "@wailsjs/go/main/App"
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { EventsOn } from "@wailsjs/runtime/runtime";
export default function Home() {
  
type activeTab = 'containers' | 'images'; 
interface ContainerItem {
  id: string;
  name: string;
  image: string;
  command: string;
  created: number;
  state: string;
  status: string;
  ports: string[];
}
interface ImageItem {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: number;
}
interface PullProgress {
  id: string;
  status: string;
  progress: string;
}


  const [resultText, setResultText] = useState("Please enter your name below 👇");
  const [name, setName] = useState('');
  const [status , setStatus] = useState('')
  const [containers, setContainers] = useState<ContainerItem[]>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [activeLogContainer, setActiveLogContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<activeTab>()
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [imageToPull, setImageToPull] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [layerProgress, setLayerProgress] = useState<Record<string, PullProgress>>({});

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

function openLogs(containerId: string) {
    setActiveLogContainer(containerId);
    setLogs([]);  
     StreamContainerLogs(containerId)
      .catch((err) => alert("Failed to open log stream: " + err));
     const unsubscribe = EventsOn("container-log-line", (line: string) => {
      setLogs((prevLogs) => [...prevLogs, line]);
    });
     return unsubscribe;
  }
function closeLogs() {
    StopContainerLogs();
    setActiveLogContainer(null);
    setLogs([]);
  }

  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);
  function greet() {
    Greet(name).then(updateResultText);
  }

  function getDockerInfo(){
     GetDockerInfo()
        .then(status => setStatus(status))
          .catch(err => setStatus(`Error: ${err.message}`));
  }

  function getContainers(){
     ListContainers()
        .then(data => {
          setContainers(data || [])
        })
        .catch(err => setStatus(`Error: ${err.message}`));
  }

   function getImages() {
    ListImages()
      .then((data) => setImages(data || []))
      .catch((err) => setStatus(`Error: ${err.message}`));
  }

  function handleStart(id: string){
      StartContainer(id)
      .then(() => {
        getContainers()
      })
      .catch(err => alert("Failed to start: " + err))
  }
 
  function handleStop(id: string){
      StopContainer(id)
      .then(() => {
        getContainers()
      })
      .catch(err => alert("Failed to start: " + err))
  }

  function handlePullImage() {
    if (!imageToPull.trim()) return;
    setIsPulling(true);
    setLayerProgress({});  
     const unsubProgress = EventsOn("image-pull-progress", (data: any) => {
      if (data.id) {
        setLayerProgress((prev) => ({
          ...prev,
          [data.id]: data,  
        }));
      }
    });
     PullImages(imageToPull)
      .then(() => {
        setIsPulling(false);
        unsubProgress();
        getImages();  
        alert(`Successfully pulled image: ${imageToPull}`);
        setIsPullModalOpen(false);
        setImageToPull('');
      })
      .catch((err) => {
        setIsPulling(false);
        unsubProgress();
        alert("Failed to pull image: " + err);
      });
  }

  function handleRemoveImage(id: string, repo: string) {
  if (confirm(`Are you sure you want to delete image "${repo}" (${id})?`)) {
    RemoveImage(id)
      .then((result) => {
         console.log("Deleted Image layers:", result);  
        getImages();  
      })
      .catch((err) => {
        alert("Failed to remove image: " + err);
      });
  }
}

  function handleRemoveContainer(id: string, name: string) {
  if (confirm(`Are you sure you want to remove this contaainner "${name}" (${id})?`)) {
    RemoveContainer(id)
      .then((result) => {
         console.log("Deleted container:", result);  
         getContainers();  
      })
      .catch((err) => {
        alert("Failed to remove container: " + err);
      });
  }
}

  useEffect(()=> {
    const unsubscribe = EventsOn("docker-event", ()=> {
       getContainers();
    });

    const unsubErrors = EventsOn("container-log-error", (errorMessage: string) => {
     setLogs((prev) => [...prev, `❌ [SYSTEM ERROR]: ${errorMessage}`]);
    });
     return () => {
      unsubscribe();
      unsubErrors();
    };
  }, [])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <div id="result" className="result">{resultText}</div>
          <div id="input" className="flex">
            <Input id="name" onChange={updateName} autoComplete="off" name="input" type="text" />
            <Button className="btn" onClick={greet}>Greet</Button>
          </div>
        </div>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
        <div>
          <Button className="btn" onClick={getDockerInfo}>Get Docker Info</Button>
          <div id="dockerInfo" className="result">{status}</div>
        </div>

      <div className="flex flex-col gap-3 w-full max-w-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Containers ({containers.length})</h2>
            <Button onClick={getContainers}>Refresh 🔄</Button>
          </div>

          {containers.map((c) => (
            <div key={c.id} className="p-4 border border-slate-700 rounded-xl bg-slate-900 text-white flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${c.state === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-bold text-lg">{c.name}</span>
                  <span className="text-xs text-slate-400">({c.id})</span>
                </div>
                <p className="text-sm text-slate-300">Image: {c.image}</p>
                <p className="text-xs text-slate-400">Status: {c.status}</p>
              </div>
              <div>
                {c.state === "running" ? (
                  <Button variant="destructive" onClick={() => handleStop(c.id)}>
                    Stop ⏹️
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStart(c.id)}>
                    Start ▶️
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => openLogs(c.id)}>
                Logs 📜
              </Button>
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveContainer(c.id, c.name)}
                  >
                    Delete 🗑️
               </Button> 
              {activeLogContainer && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl p-4 flex flex-col gap-3 shadow-2xl">
                    
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        Live Logs: <span className="font-mono text-slate-400">({activeLogContainer})</span>
                      </h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setLogs([])}>Clear</Button>
                        <Button size="sm" variant="destructive" onClick={closeLogs}>Close ✖</Button>
                      </div>
                    </div>
                    <div 
                      ref={logContainerRef} 
                      className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg h-96 overflow-y-auto whitespace-pre-wrap flex flex-col gap-1 border border-slate-800"
                    >
                      {logs.length === 0 ? (
                        <span className="text-slate-500 italic">Waiting for container log output...</span>
                      ) : (
                        logs.map((line, index) => (
                          <div key={index} className="leading-relaxed">{line}</div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>        
            ))}
          </div>     
          <div>
        </div>
        <div className="flex gap-2 border-b border-slate-700 w-full max-w-4xl pb-2 mb-4">
          <button
            className={`px-4 py-2 font-bold rounded-lg transition ${
              activeTab === 'containers' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('containers')}
          >
            Containers 📦 ({containers.length})
          </button>

          <button
            className={`px-4 py-2 font-bold rounded-lg transition ${
              activeTab === 'images' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            onClick={() => {
              setActiveTab('images');
              getImages();
            }}
          >
            Images 🖼️ ({images.length})
          </button>
        </div>
       {activeTab === 'images' && (
          <div className="flex flex-col gap-3 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Downloaded Images ({images.length})</h2>
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsPullModalOpen(true)}>
                  Pull Image 📥
                </Button>
                <Button onClick={getImages}>Refresh 🔄</Button>
              </div>
         </div>
          {images.length === 0 ? (
            <p className="text-slate-400">No images downloaded.</p>
          ) : (
            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-800 text-slate-400 font-mono text-xs uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">Repository</th>
                    <th className="p-3">Tag</th>
                    <th className="p-3">Image ID</th>
                    <th className="p-3">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {images.map((img) => (
                    <tr key={img.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-white">{img.repository}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-900/80 text-blue-300 rounded font-mono text-xs border border-blue-700">
                          {img.tag}
                        </span>
                         <td className="p-3">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemoveImage(img.id, img.repository)}
                            >
                              Delete 🗑️
                            </Button>
                          </td>
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-400">{img.id}</td>
                      <td className="p-3 font-mono text-xs text-green-400">{img.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    {isPullModalOpen && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
          
          <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <h3 className="text-lg font-bold text-white">Pull Image from Docker Hub</h3>
            {!isPulling && (
              <Button size="sm" variant="ghost" onClick={() => setIsPullModalOpen(false)}>✖</Button>
            )}
          </div>

           <div className="flex gap-2">
            <Input 
              placeholder="e.g. redis:alpine, postgres:alpine, nginx" 
              value={imageToPull}
              onChange={(e) => setImageToPull(e.target.value)}
              disabled={isPulling}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handlePullImage}
              disabled={isPulling || !imageToPull.trim()}
            >
              {isPulling ? "Pulling..." : "Pull 📥"}
            </Button>
          </div>
           {Object.keys(layerProgress).length > 0 && (
            <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-60 overflow-y-auto font-mono text-xs">
              {Object.values(layerProgress).map((layer) => (
                <div key={layer.id} className="flex justify-between items-center border-b border-slate-900 pb-1">
                  <span className="text-slate-400 font-bold">{layer.id}</span>
                  <span className="text-blue-400">{layer.status}</span>
                  <span className="text-slate-500 text-[10px]">{layer.progress}</span>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        )}
      
      </footer>
    </div>
  );
}
