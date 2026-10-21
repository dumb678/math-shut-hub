import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Trash2, Lightbulb, Check } from 'lucide-react';
import { MathProblem } from '../types';
import { soundManager } from '../utils/audio';

interface ScratchpadModalProps {
  problem: MathProblem;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ problem, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#38bdf8');
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Initial white grid background for math lined notebook feel
    drawNotebookGrid(ctx, rect.width, rect.height);
  }, []);

  const drawNotebookGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let y = 30; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let x = 30; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawNotebookGrid(ctx, rect.width, rect.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 flex flex-col max-h-[92vh]">
        
        {/* Header with Problem Display */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
              📝 연산 계산 연습장
            </div>
            <div className="text-2xl sm:text-3xl font-black font-jua text-amber-300 mt-0.5">
              {problem.displayQuestion}
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
          {/* Tool selectors */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-jua flex items-center gap-1.5 cursor-pointer ${
                tool === 'pen'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>펜</span>
            </button>

            {tool === 'pen' && (
              <div className="flex gap-1.5 ml-1">
                {['#38bdf8', '#facc15', '#4ade80', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      penColor === color ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-60'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-xl text-xs font-jua flex items-center gap-1.5 cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>지우개</span>
            </button>

            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-xl text-xs font-jua bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>전체 지우기</span>
            </button>
          </div>

          {/* Hint button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowHint(!showHint);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-jua flex items-center gap-1.5 border transition-all cursor-pointer ${
              showHint
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-amber-300'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>{showHint ? '힌트 숨기기' : '단계별 풀이 힌트 보기'}</span>
          </button>
        </div>

        {/* Step-by-step Hint Box if toggled */}
        {showHint && (
          <div className="mb-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs space-y-1.5 animate-fadeIn">
            <div className="font-bold text-amber-300 font-jua flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>선생님의 세로셈 가이드</span>
            </div>
            {problem.stepExplanation.map((step, idx) => (
              <div key={idx} className="text-amber-100 font-mono pl-1">
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Interactive Drawing Canvas */}
        <div className="flex-1 w-full min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden border-2 border-slate-700/80 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute bottom-2 right-3 text-[11px] text-slate-500 pointer-events-none">
            모눈종이에 세로셈을 직접 써보세요
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            필기가 끝나면 [게임으로 돌아가기]를 눌러 정답 행성을 맞추세요!
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-jua text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>게임으로 복귀</span>
          </button>
        </div>

      </div>
    </div>
  );
};
