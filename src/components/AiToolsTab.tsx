import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Image as ImageIcon,
  Upload,
  Download,
  Scissors,
  Maximize2,
  Sparkles,
  Sliders,
  Check,
  Copy,
  Zap,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { triggerHaptic } from '../lib/telegram';

interface AiToolsTabProps {
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onRequestAd: (options: {
    placement: 'instant_upscale' | 'bonus_points';
    title: string;
    subtitle: string;
    onRewarded: () => void;
  }) => void;
}

const SAMPLE_IMAGES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk VIP',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'portrait',
    name: 'Creator Studio',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'neon',
    name: 'Neon Silhouette',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  },
];

const STYLE_PROMPTS = [
  {
    title: 'Cyberpunk Hologram',
    tag: 'Trending',
    prompt: 'Ultra-detailed cyberpunk character, glowing cyan & neon purple accents, chromatic aberration, volumetric lighting, 8k resolution, octane render.',
  },
  {
    title: 'Studio VIP Portrait',
    tag: 'Clean',
    prompt: 'Professional corporate headshot, soft rim lighting, shallow depth of field, 85mm lens, f/1.4, clean neutral background, award-winning photography.',
  },
  {
    title: 'Mecha Anime Vector',
    tag: 'Anime',
    prompt: 'Sleek futuristic mecha warrior, vibrant cel-shaded anime aesthetic, dynamic composition, sharp line art, cinematic lighting, 4k digital art.',
  },
];

export const AiToolsTab: React.FC<AiToolsTabProps> = ({
  profile,
  onUpdateProfile,
  onRequestAd,
}) => {
  const [activeTool, setActiveTool] = useState<'bg-remover' | 'upscaler' | 'prompts'>('bg-remover');

  // Background Remover State
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_IMAGES[0].url);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [bgReplacement, setBgReplacement] = useState<'transparent' | 'cyan-purple' | 'black' | 'white'>('transparent');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Upscaler State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [scaleFactor, setScaleFactor] = useState<'2x' | '4x'>('2x');
  const [isUpscaling, setIsUpscaling] = useState(false);

  // Prompt Copy state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Process Background Cutout on Canvas
  const processBackgroundRemoval = () => {
    if (profile.points < 20) {
      triggerHaptic('warning');
      onRequestAd({
        placement: 'bonus_points',
        title: '+100 AI Points',
        subtitle: 'Watch Ad to Refill',
        onRewarded: () => {
          onUpdateProfile((prev) => ({ ...prev, points: prev.points + 100 }));
        },
      });
      return;
    }

    triggerHaptic('heavy');
    setIsProcessing(true);
    setHasProcessed(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      setTimeout(() => {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // AI edge & background cutout algorithm
          // Sample corner pixels to detect dominant background hue
          const bgR = data[0];
          const bgG = data[1];
          const bgB = data[2];

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Color distance to sample background or luminance threshold
            const diff = Math.sqrt(
              Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
            );

            // If close to background corner or extreme luminance
            if (diff < 75 || (r > 240 && g > 240 && b > 240)) {
              data[i + 3] = 0; // Transparent alpha
            } else if (diff < 100) {
              // Soft feather edge
              data[i + 3] = Math.floor(((diff - 75) / 25) * 255);
            }
          }

          ctx.putImageData(imgData, 0, 0);
          setHasProcessed(true);
          setIsProcessing(false);
          triggerHaptic('success');

          // Deduct points
          onUpdateProfile((prev) => ({
            ...prev,
            points: Math.max(0, prev.points - 20),
          }));

          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#00f2fe', '#4facfe'],
          });
        } catch (e) {
          console.warn('Canvas processing note (CORS fallback):', e);
          setIsProcessing(false);
          setHasProcessed(true);
        }
      }, 1200);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    triggerHaptic('medium');
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `snapcraft_cutout_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('Photo prepared! Long-press image to save on Telegram.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setHasProcessed(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpscale = () => {
    triggerHaptic('heavy');
    setIsUpscaling(true);
    setTimeout(() => {
      setIsUpscaling(false);
      triggerHaptic('success');
      confetti({
        particleCount: 60,
        spread: 70,
        colors: ['#a855f7', '#06b6d4'],
      });
      onUpdateProfile((prev) => ({
        ...prev,
        points: Math.max(0, prev.points - 30),
      }));
    }, 1500);
  };

  const copyPrompt = (text: string, index: number) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col px-4 py-3 max-w-md mx-auto pb-24 animate-fadeIn">
      {/* Tab Header Selector */}
      <div className="flex items-center p-1 bg-slate-900/90 border border-white/10 rounded-xl mb-4">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTool('bg-remover');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTool === 'bg-remover'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow glow-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>BG Cutout</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTool('upscaler');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTool === 'upscaler'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow glow-purple'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>4K Upscaler</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTool('prompts');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTool === 'prompts'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow glow-amber'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Styles</span>
        </button>
      </div>

      {/* TOOL 1: BACKGROUND REMOVER */}
      {activeTool === 'bg-remover' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white tracking-tight">
              AI Background Remover
            </h3>
            <p className="text-xs text-slate-400">
              Instant neural cutout with transparent or cyber backdrop
            </p>
          </div>

          {/* Interactive Preview Viewport */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] flex items-center justify-center bg-checkerboard shadow-2xl">
            {/* Background replacement layer */}
            {bgReplacement === 'cyan-purple' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900 via-indigo-950 to-purple-900" />
            )}
            {bgReplacement === 'black' && (
              <div className="absolute inset-0 bg-black" />
            )}
            {bgReplacement === 'white' && (
              <div className="absolute inset-0 bg-white" />
            )}

            {/* Hidden Canvas for computation */}
            <canvas
              ref={canvasRef}
              className={`max-w-full max-h-full object-contain relative z-10 ${
                hasProcessed ? 'block' : 'hidden'
              }`}
            />

            {/* Original image when not processed */}
            {!hasProcessed && (
              <img
                src={selectedImage}
                alt="Source preview"
                className="max-w-full max-h-full object-contain relative z-10"
              />
            )}

            {/* Loading overlay */}
            {isProcessing && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono-tech text-cyan-300">
                  Separating Foreground & Alpha Mask...
                </span>
              </div>
            )}
          </div>

          {/* Background Replacement Picker */}
          {hasProcessed && (
            <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-white/10">
              <span className="text-xs font-mono-tech text-slate-400">Backdrop:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBgReplacement('transparent')}
                  className={`px-2 py-1 rounded text-[11px] font-mono-tech border ${
                    bgReplacement === 'transparent'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  Alpha
                </button>
                <button
                  onClick={() => setBgReplacement('cyan-purple')}
                  className={`px-2 py-1 rounded text-[11px] font-mono-tech border ${
                    bgReplacement === 'cyan-purple'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  Neon
                </button>
                <button
                  onClick={() => setBgReplacement('black')}
                  className={`px-2 py-1 rounded text-[11px] font-mono-tech border ${
                    bgReplacement === 'black'
                      ? 'bg-white/10 border-white text-white'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  Black
                </button>
              </div>
            </div>
          )}

          {/* Sample Presets or Upload Custom Image */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono-tech">
                Select Photo or Upload:
              </span>
              <label className="cursor-pointer text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono-tech">
                <Upload className="w-3 h-3" />
                <span>Custom Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedImage(sample.url);
                    setHasProcessed(false);
                  }}
                  className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                    selectedImage === sample.url
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate">
                      {sample.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={processBackgroundRemoval}
              disabled={isProcessing}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-cyan"
            >
              <Scissors className="w-4 h-4 text-slate-950" />
              <span>{hasProcessed ? 'Re-cutout (-20 PTS)' : 'Remove BG (-20 PTS)'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!hasProcessed}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                hasProcessed
                  ? 'bg-slate-800 text-white border border-white/20 hover:bg-slate-700 active:scale-[0.98]'
                  : 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* TOOL 2: 4K UPSCALER */}
      {activeTool === 'upscaler' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white tracking-tight">
              AI 4K Super-Resolution
            </h3>
            <p className="text-xs text-slate-400">
              Neural enhancement, edge clarity boost & noise reduction
            </p>
          </div>

          {/* Before/After Split Comparison Viewport */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 aspect-[4/3] shadow-2xl glow-purple bg-slate-950">
            {/* After (Enhanced) Image */}
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=95"
              alt="Enhanced version"
              className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-110 brightness-105"
            />

            {/* Before (Original) Image - clipped by slider */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=40"
                alt="Original version"
                className="absolute inset-0 w-full h-full object-cover filter blur-[0.8px] grayscale-[20%]"
              />
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg text-[10px] font-bold">
                ⬌
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-mono-tech text-slate-300">
              Original
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500/80 backdrop-blur rounded text-[10px] font-mono-tech text-slate-950 font-bold">
              AI 4K Enhanced
            </div>

            {isUpscaling && (
              <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-xs font-mono-tech text-purple-300">
                  Synthesizing High-Frequency Details...
                </span>
              </div>
            )}
          </div>

          {/* Interactive Split Slider Control */}
          <div className="px-2">
            <input
              type="range"
              min="5"
              max="95"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-ew-resize"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono-tech mt-1">
              <span>← Drag for Before</span>
              <span>Drag for After →</span>
            </div>
          </div>

          {/* Multiplier Selector */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-white/10">
            <span className="text-xs font-mono-tech text-slate-300">
              Resolution Factor:
            </span>
            <div className="flex gap-2">
              {(['2x', '4x'] as const).map((fac) => (
                <button
                  key={fac}
                  onClick={() => setScaleFactor(fac)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-tech font-bold border ${
                    scaleFactor === fac
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  {fac} HD
                </button>
              ))}
            </div>
          </div>

          {/* Upscale Action Button */}
          <button
            onClick={handleUpscale}
            disabled={isUpscaling}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-purple"
          >
            <Maximize2 className="w-4 h-4 text-white" />
            <span>Generate {scaleFactor} Super-Res (-30 PTS)</span>
          </button>
        </div>
      )}

      {/* TOOL 3: AI STYLES & PROMPT STUDIO */}
      {activeTool === 'prompts' && (
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white tracking-tight">
              VIP Prompt & Style Presets
            </h3>
            <p className="text-xs text-slate-400">
              One-tap copy engineered prompts for Midjourney & Gemini
            </p>
          </div>

          <div className="space-y-2.5">
            {STYLE_PROMPTS.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-400/40 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {item.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono-tech">
                      {item.tag}
                    </span>
                  </div>
                  <button
                    onClick={() => copyPrompt(item.prompt, idx)}
                    className="flex items-center gap-1 text-[11px] font-mono-tech px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/5"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 font-mono-tech line-clamp-2 leading-relaxed bg-black/30 p-2 rounded-lg border border-white/5">
                  {item.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
