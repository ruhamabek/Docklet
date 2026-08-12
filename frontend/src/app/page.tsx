"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { GetDockerInfo, Greet, ListContainers, StartContainer, StopContainer, StopContainerLogs, StreamContainerLogs } from "@wailsjs/go/main/App"
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { EventsOn } from "@wailsjs/runtime/runtime";
export default function Home() {
  const [resultText, setResultText] = useState("Please enter your name below 👇");
  const [name, setName] = useState('');
  const [status , setStatus] = useState('')
  const [containers, setContainers] = useState<any[]>([])
  const [activeLogContainer, setActiveLogContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
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

  useEffect(()=> {
    const unsubscribe = EventsOn("docker-event", (action)=> {
       getContainers();
    });

    return () => unsubscribe();
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
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
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
      </footer>
    </div>
  );
}
