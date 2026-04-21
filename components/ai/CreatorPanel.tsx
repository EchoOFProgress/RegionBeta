"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { creator } from "@/lib/ai/creator";
import { GeneratedModule } from "@/lib/ai/output-validator";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Sparkles, AlertTriangle, Blocks, Check, X, Key } from "lucide-react";
import { storage } from "@/lib/storage";

export function CreatorPanel() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [generatedModule, setGeneratedModule] = useState<GeneratedModule | null>(null);
  const [accepted, setAccepted] = useState(false);
  
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    setErrorText("");
    setGeneratedModule(null);
    setAccepted(false);

    try {
      const result = await creator.generateModule(input, user?.id);
      
      if (!result.valid || !result.data) {
        const err = result.error || "Validace modulu selhala.";
        setErrorText(err === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : err);
      } else {
         setGeneratedModule(result.data);
      }
    } catch (error: any) {
      const msg = error.message || "Došlo k chybě při generování.";
      setErrorText(msg === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
      if (!generatedModule) return;
      
      // Save Challenge
      const challenges = storage.load("challenges", []);
      const newChallengeId = Math.random().toString(36).substring(2, 9);
      challenges.push({
          id: newChallengeId,
          title: generatedModule.challenge.title,
          description: generatedModule.challenge.description,
          duration: generatedModule.challenge.duration,
          goalType: generatedModule.challenge.goalType,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + generatedModule.challenge.duration * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          difficulty: generatedModule.challenge.difficulty || 5, // fallback
          currentDay: 1,
          icon: "Sparkles",
          isPublic: false,
          archived: false,
          notes: {},
          dailyProgress: [],
          bestStreak: 0,
          currentStreak: 0,
          lastCheckedIn: null
      });
      storage.save("challenges", challenges);

      // Save Tasks linked to this challenge
      const tasks = storage.load("tasks", []);
      for (const t of generatedModule.tasks) {
          tasks.push({
              id: Math.random().toString(36).substring(2, 9),
              title: t.title,
              description: t.description || "",
              priority: 2,
              completed: false,
              type: t.type === "numeric" || t.type === "timer" ? t.type : "todo", // Mapping types safely
              timeEstimate: t.timeEstimate || 15,
              linkedGoalId: newChallengeId, // Link task to challenge
              createdAt: new Date().toISOString()
          });
      }
      storage.save("tasks", tasks);
      
      setAccepted(true);
      
      // Reload page state to reflect new data (in a real app we'd dispatch an event/context refresh)
      // Since this is a simple static app, reloading is a blunt but effective way to sync tabs
      setTimeout(() => window.location.reload(), 1500);
  };

  const handleReject = () => {
      setGeneratedModule(null);
      setInput("");
  };

  return (
    <div className="space-y-6 flex flex-col h-full bg-card p-6 rounded-lg border border-border">
      <div className="space-y-2">
         <h2 className="text-2xl font-bold flex items-center gap-2">
            <Blocks className="h-6 w-6 text-primary" />
            Module Creator
         </h2>
         <p className="text-muted-foreground">Popište svůj cíl, kterého chcete dosáhnout, a já navrhnu kompletní tréninkovou výzvu s úkoly.</p>
      </div>

      <div className="space-y-3">
         <Textarea 
            placeholder="Chci začít vstávat před 6:00 a naučit se číst každý den alespoň 20 minut."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
            disabled={isGenerating || !!generatedModule}
         />
         {!generatedModule && (
            <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !input.trim()}
                className="w-full gap-2"
                variant="default"
            >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? "Architekuji systém..." : "Vygenerovat Modul"}
            </Button>
         )}
      </div>

      <div className="pt-4 flex-1">
          {errorText === "QUOTA_EXCEEDED" && (
             <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 p-4 rounded-md flex items-start gap-3">
                 <Key className="h-5 w-5 mt-0.5 flex-shrink-0" />
                 <div className="text-sm space-y-1">
                     <p className="font-medium">Byl překročen limit API klíče.</p>
                     <p className="opacity-80">Přidej vlastní Gemini API klíč v <strong>Nastavení → Účet</strong>. Klíč získáš zdarma na <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com</a>.</p>
                 </div>
             </div>
          )}
          {errorText && errorText !== "QUOTA_EXCEEDED" && (
             <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                 <p className="text-sm">{errorText}</p>
             </div>
          )}

          {accepted && (
             <div className="bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-md flex flex-col items-center justify-center gap-3 py-8">
                 <Check className="h-8 w-8" />
                 <p className="font-medium">Modul úspěšně implementován.</p>
                 <p className="text-sm opacity-80">Obnovuji dashboard...</p>
             </div>
          )}

          {generatedModule && !accepted && (
             <div className="space-y-4 border border-border rounded-lg bg-background p-4 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center justify-between border-b border-border pb-3">
                     <h3 className="font-bold text-lg text-primary">{generatedModule.challenge.title}</h3>
                     <span className="text-xs font-mono px-2 py-1 bg-muted rounded-full">{generatedModule.challenge.duration} Dní</span>
                 </div>
                 
                 <p className="text-sm text-foreground/90 italic border-l-2 border-primary/50 pl-3">
                     "{generatedModule.challenge.description}"
                 </p>

                 <div className="space-y-2 pt-2">
                     <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Taktické Úkoly:</h4>
                     <ul className="space-y-2">
                         {generatedModule.tasks.map((task, i) => (
                             <li key={i} className="flex gap-2 text-sm bg-muted/50 p-2 rounded">
                                 <div className="h-5 w-5 rounded border border-primary/50 flex flex-shrink-0 items-center justify-center text-primary/50 text-[10px] mt-0.5" />
                                 <div>
                                     <p className="font-medium">{task.title}</p>
                                     {task.description && <p className="text-xs text-muted-foreground pt-1">{task.description}</p>}
                                 </div>
                             </li>
                         ))}
                     </ul>
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-border mt-2">
                     <Button variant="outline" className="flex-1 gap-2" onClick={handleReject}>
                         <X className="h-4 w-4" /> Zamítnout
                     </Button>
                     <Button className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAccept}>
                         <Check className="h-4 w-4" /> Implementovat
                     </Button>
                 </div>
             </div>
          )}
      </div>
    </div>
  );
}
