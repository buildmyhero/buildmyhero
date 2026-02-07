import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Loader2, Sparkles, User, Scroll, Palette } from "lucide-react";

const progressSteps = [
  { id: 1, label: "Analyzing your concept...", icon: Sparkles, duration: 1500 },
  { id: 2, label: "Generating ability scores...", icon: User, duration: 2000 },
  { id: 3, label: "Creating character portrait...", icon: Palette, duration: 2500 },
  { id: 4, label: "Building character sheet...", icon: Scroll, duration: 2000 },
];

export default function GeneratePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    
    const runSteps = () => {
      if (stepIndex < progressSteps.length) {
        setCurrentStep(stepIndex);
        setProgress(((stepIndex + 1) / progressSteps.length) * 100);
        
        setTimeout(() => {
          stepIndex++;
          runSteps();
        }, progressSteps[stepIndex].duration);
      } else {
        // Generation complete, navigate to preview
        navigate(`/character/placeholder/preview`);
      }
    };

    runSteps();
  }, [navigate, id]);

  const CurrentIcon = progressSteps[currentStep]?.icon || Sparkles;

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-purple animate-glow-pulse flex items-center justify-center">
              <CurrentIcon className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-gold/30 animate-ping" style={{ animationDuration: "2s" }} />
          </div>

          {/* Status Text */}
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-4 animate-fade-in">
            Creating Your Hero
          </h1>
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {progressSteps[currentStep]?.label || "Almost there..."}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-button transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </p>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {progressSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? "bg-gold" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
