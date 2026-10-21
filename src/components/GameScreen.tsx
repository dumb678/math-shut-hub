import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Heart, Pause, Play, Volume2, VolumeX, Edit3, Flame, Shield, Clock, Bomb, ArrowLeft } from 'lucide-react';
import { PlayerProfile, MathProblem, QuestionRecord } from '../types';
import { generateMathProblem } from '../utils/mathGenerator';
import { getShipById } from '../utils/ships';
import { soundManager } from '../utils/audio';
import { saveLeaderboardEntry } from '../utils/leaderboard';
import { recordGameStats } from '../utils/playerStats';
import { ScratchpadModal } from './ScratchpadModal';
import { GameOverModal } from './GameOverModal';
import { LeaderboardModal } from './LeaderboardModal';

interface GameScreenProps {
  profile: PlayerProfile;
  onExit: () => void;
}

interface Bullet {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
}

interface TargetOrb {
  id: string;
  value: number;
  isCorrect: boolean;
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  glowColor: string;
  hp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

interface DropItem {
  id: string;
  type: 'heart' | 'freeze' | 'bomb';
  x: number;
  y: number;
  radius: number;
  speed: number;
}

export const GameScreen: React.FC<GameScreenProps> = ({ profile, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React state
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateMathProblem(profile.mode));
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [questionHistory, setQuestionHistory] = useState<QuestionRecord[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(soundManager.getMuted());
  const [noticeMessage, setNoticeMessage] = useState<{ text: string; type: 'correct' | 'wrong' | 'item' } | null>(null);

  // Time tracking
  const questionStartTimeRef = useRef<number>(Date.now());
  const shipModel = getShipById(profile.shipId);

  // Mutable Game Loop State in Refs for 60fps smoothness
  const stateRef = useRef({
    playerX: 0,
    playerY: 0,
    targetX: 0,
    bullets: [] as Bullet[],
    targets: [] as TargetOrb[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    dropItems: [] as DropItem[],
    keys: {
      left: false,
      right: false,
      shoot: false
    },
    lastShotTime: 0,
    freezeTimer: 0,
    screenShake: 0,
    stars: [] as { x: number; y: number; size: number; speed: number; alpha: number }[]
  });

  // Base speed factor based on difficulty
  const speedMultiplier = profile.difficulty === 'easy' ? 0.75 : profile.difficulty === 'hard' ? 1.35 : 1.0;

  // Initialize targets for current problem
  const spawnTargetsForProblem = useCallback((problem: MathProblem, canvasWidth: number) => {
    const options = problem.options;
    const count = options.length;
    const margin = 40;
    const availableWidth = canvasWidth - margin * 2;
    const colWidth = availableWidth / count;

    // Palette of vibrant colors for targets
    const colors = [
      { fill: '#1e293b', stroke: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
      { fill: '#1e293b', stroke: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
      { fill: '#1e293b', stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
      { fill: '#1e293b', stroke: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' }
    ];

    const newTargets: TargetOrb[] = options.map((opt, i) => {
      // Stagger initial Y slightly so they feel natural
      const startX = margin + colWidth * i + colWidth / 2 + (Math.random() * 20 - 10);
      const startY = -40 - (i % 2) * 45;
      const theme = colors[i % colors.length];

      return {
        id: `target_${i}_${Date.now()}`,
        value: opt,
        isCorrect: opt === problem.correctAnswer,
        x: startX,
        y: startY,
        radius: 38,
        speed: (0.8 + Math.random() * 0.3) * speedMultiplier,
        color: theme.stroke,
        glowColor: theme.glow,
        hp: 1
      };
    });

    stateRef.current.targets = newTargets;
    questionStartTimeRef.current = Date.now();
  }, [speedMultiplier]);

  // Trigger floating text
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    stateRef.current.floatingTexts.push({
      id: `float_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale: 1.0
    });
  };

  // Trigger explosion particles
  const addExplosion = (x: number, y: number, color: string, count: number = 24) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = Math.random() * 4.5 + 1.5;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.5,
        color,
        alpha: 1,
        life: 1
      });
    }
  };

  // Shoot bullet
  const shootBullet = useCallback(() => {
    const now = Date.now();
    if (now - stateRef.current.lastShotTime < 200) return; // Fire rate limit
    stateRef.current.lastShotTime = now;

    const px = stateRef.current.playerX;
    const py = stateRef.current.playerY;

    // Twin laser cannons
    stateRef.current.bullets.push(
      {
        x: px - 14,
        y: py - 20,
        radius: 3.5,
        speed: 12,
        color: shipModel.bulletColor
      },
      {
        x: px + 14,
        y: py - 20,
        radius: 3.5,
        speed: 12,
        color: shipModel.bulletColor
      }
    );

    soundManager.playLaser();
  }, [shipModel.bulletColor]);

  // Handle problem solved
  const handleCorrectHit = (target: TargetOrb) => {
    soundManager.playCorrect();
    soundManager.playExplosion();
    addExplosion(target.x, target.y, '#38bdf8', 35);
    addExplosion(target.x, target.y, '#fbbf24', 20);

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const newCombo = combo + 1;
    setCombo(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);

    // Scoring: 100 base + combo bonus
    const pointsGained = 100 + (newCombo - 1) * 30;
    setScore(prev => prev + pointsGained);

    addFloatingText(`+${pointsGained} 🎯 정답!`, target.x, target.y - 10, '#38bdf8');
    if (newCombo >= 2) {
      addFloatingText(`${newCombo} 콤보 폭발! 🔥`, target.x, target.y - 35, '#fbbf24');
    }

    setNoticeMessage({
      text: `🎉 정답입니다! ${currentProblem.displayQuestion.replace('?', target.value.toLocaleString())}`,
      type: 'correct'
    });

    // Record in history
    setQuestionHistory(prev => [
      ...prev,
      {
        problem: currentProblem,
        userAnswer: target.value,
        isCorrect: true,
        timeSpentSeconds: timeSpent
      }
    ]);

    // Random powerup drop (15% chance)
    if (Math.random() < 0.25) {
      const dropTypes: ('heart' | 'freeze' | 'bomb')[] = ['heart', 'freeze', 'bomb'];
      const chosenType = dropTypes[Math.floor(Math.random() * dropTypes.length)];
      stateRef.current.dropItems.push({
        id: `drop_${Date.now()}`,
        type: chosenType,
        x: target.x,
        y: target.y,
        radius: 18,
        speed: 2.2
      });
    }

    // Generate next problem
    setTimeout(() => {
      const nextProblem = generateMathProblem(profile.mode);
      setCurrentProblem(nextProblem);
      const canvas = canvasRef.current;
      if (canvas) {
        spawnTargetsForProblem(nextProblem, canvas.clientWidth);
      }
    }, 400);
  };

  // Handle wrong target hit
  const handleWrongHit = (target: TargetOrb) => {
    soundManager.playWrong();
    addExplosion(target.x, target.y, '#f43f5e', 20);
    stateRef.current.screenShake = 12;

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    setCombo(0);

    const nextLives = lives - 1;
    setLives(nextLives);

    addFloatingText('앗! 오답! -❤️', target.x, target.y - 10, '#f43f5e');
    setNoticeMessage({
      text: `⚠️ [${target.value.toLocaleString()}]은(는) 오답입니다! 올바른 답을 다시 찾아보세요.`,
      type: 'wrong'
    });

    // Remove the shot wrong target so student can still target the others
    stateRef.current.targets = stateRef.current.targets.filter(t => t.id !== target.id);

    // If out of lives, end game
    if (nextLives <= 0) {
      soundManager.playGameOver();
      setQuestionHistory(prev => [
        ...prev,
        {
          problem: currentProblem,
          userAnswer: target.value,
          isCorrect: false,
          timeSpentSeconds: timeSpent
        }
      ]);
      triggerGameOver();
    }
  };

  // Handle drop item collect
  const handleItemCollect = (item: DropItem) => {
    soundManager.playPowerup();
    stateRef.current.dropItems = stateRef.current.dropItems.filter(i => i.id !== item.id);
    addExplosion(item.x, item.y, '#34d399', 15);

    if (item.type === 'heart') {
      setLives(prev => Math.min(prev + 1, 4));
      addFloatingText('❤️ 보호막 회복!', item.x, item.y, '#f43f5e');
      setNoticeMessage({ text: '❤️ 보호막이 충전되었습니다!', type: 'item' });
    } else if (item.type === 'freeze') {
      stateRef.current.freezeTimer = 300; // 5 seconds at 60fps
      addFloatingText('⏰ 시간 감속 발동!', item.x, item.y, '#38bdf8');
      setNoticeMessage({ text: '⏰ 시간 정지 아이템! 행성이 느려집니다.', type: 'item' });
    } else if (item.type === 'bomb') {
      // Smart bomb destroys distractors!
      stateRef.current.targets.forEach(t => {
        if (!t.isCorrect) {
          addExplosion(t.x, t.y, '#f97316', 15);
        }
      });
      stateRef.current.targets = stateRef.current.targets.filter(t => t.isCorrect);
      addFloatingText('💣 스마트 폭탄! 오답 제거!', item.x, item.y, '#fbbf24');
      setNoticeMessage({ text: '💣 오답이 제거되어 정답만 남았습니다!', type: 'item' });
    }
  };

  const triggerGameOver = () => {
    setIsGameOver(true);
    // Save to leaderboard
    const totalQ = questionHistory.length + 1;
    const correctQ = questionHistory.filter(q => q.isCorrect).length;
    const finalAccuracy = Math.round((correctQ / totalQ) * 100);

    saveLeaderboardEntry({
      nickname: profile.nickname,
      score,
      mode: profile.mode,
      accuracy: finalAccuracy,
      correctCount: correctQ,
      totalCount: totalQ,
      maxCombo,
      shipId: profile.shipId
    });

    // Record persistent player level and exp progression
    recordGameStats(score, correctQ, totalQ);
  };

  // Initialize stars and position on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    stateRef.current.playerX = width / 2;
    stateRef.current.playerY = height - 70;
    stateRef.current.targetX = width / 2;

    // Generate stars
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2
      });
    }
    stateRef.current.stars = stars;

    spawnTargetsForProblem(currentProblem, width);
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showScratchpad || isPaused || isGameOver) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        stateRef.current.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        stateRef.current.keys.right = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        stateRef.current.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shootBullet, showScratchpad, isPaused, isGameOver]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // If paused or game over or scratchpad open, draw freeze frame
      if (!isPaused && !isGameOver && !showScratchpad) {
        // 1. Update Game State
        const state = stateRef.current;

        // Auto shoot if enabled
        if (profile.autoShoot) {
          shootBullet();
        }

        // Screen shake decay
        if (state.screenShake > 0) {
          state.screenShake *= 0.9;
          if (state.screenShake < 0.2) state.screenShake = 0;
        }

        // Freeze timer decay
        const isFrozen = state.freezeTimer > 0;
        if (isFrozen) {
          state.freezeTimer -= 1;
        }

        // Move Player via Keyboard
        const moveSpeed = 7.5;
        if (state.keys.left) {
          state.playerX = Math.max(35, state.playerX - moveSpeed);
          state.targetX = state.playerX;
        }
        if (state.keys.right) {
          state.playerX = Math.min(width - 35, state.playerX + moveSpeed);
          state.targetX = state.playerX;
        }

        // Smooth glide toward mouse/touch target if dragged
        if (Math.abs(state.targetX - state.playerX) > 1) {
          state.playerX += (state.targetX - state.playerX) * 0.25;
          state.playerX = Math.max(35, Math.min(width - 35, state.playerX));
        }

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.y -= b.speed;
          if (b.y < -10) {
            state.bullets.splice(i, 1);
            continue;
          }

          // Bullet - Target collision check
          for (let j = state.targets.length - 1; j >= 0; j--) {
            const t = state.targets[j];
            const dist = Math.hypot(b.x - t.x, b.y - t.y);
            if (dist < t.radius + b.radius) {
              // Hit target!
              state.bullets.splice(i, 1);
              if (t.isCorrect) {
                handleCorrectHit(t);
              } else {
                handleWrongHit(t);
              }
              break;
            }
          }
        }

        // Update Targets
        const currentSpeedScale = isFrozen ? 0.35 : 1.0;
        let correctTargetEscaped = false;

        for (let i = state.targets.length - 1; i >= 0; i--) {
          const t = state.targets[i];
          t.y += t.speed * currentSpeedScale;

          // Gentle sway
          t.x += Math.sin(t.y * 0.03 + i) * 0.6;
          t.x = Math.max(t.radius + 10, Math.min(width - t.radius - 10, t.x));

          // Reached bottom
          if (t.y > height + t.radius) {
            if (t.isCorrect) {
              correctTargetEscaped = true;
            }
            state.targets.splice(i, 1);
          }
        }

        // If correct target reached bottom without being shot
        if (correctTargetEscaped) {
          soundManager.playWrong();
          setCombo(0);
          setNoticeMessage({
            text: `⏰ 정답 행성을 놓쳤습니다! 정답은 [${currentProblem.correctAnswer.toLocaleString()}]였습니다.`,
            type: 'wrong'
          });
          const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
          setQuestionHistory(prev => [
            ...prev,
            {
              problem: currentProblem,
              userAnswer: null,
              isCorrect: false,
              timeSpentSeconds: timeSpent
            }
          ]);
          // Spawn new problem
          const nextProblem = generateMathProblem(profile.mode);
          setCurrentProblem(nextProblem);
          spawnTargetsForProblem(nextProblem, width);
        }

        // Update Drop Items
        for (let i = state.dropItems.length - 1; i >= 0; i--) {
          const item = state.dropItems[i];
          item.y += item.speed;

          // Check player collision
          const distToPlayer = Math.hypot(item.x - state.playerX, item.y - state.playerY);
          if (distToPlayer < item.radius + 30) {
            handleItemCollect(item);
            continue;
          }

          if (item.y > height + item.radius) {
            state.dropItems.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.025;
          if (p.alpha <= 0) {
            state.particles.splice(i, 1);
          }
        }

        // Update Floating Texts
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y -= 1.0;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) {
            state.floatingTexts.splice(i, 1);
          }
        }

        // Update Background Stars
        for (const star of state.stars) {
          star.y += star.speed;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
      }

      // 2. Draw Frame
      ctx.save();

      // Screen shake translation
      if (stateRef.current.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * stateRef.current.screenShake;
        const shakeY = (Math.random() - 0.5) * stateRef.current.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Background space
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (const star of stateRef.current.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drop Items
      for (const item of stateRef.current.dropItems) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.shadowColor = item.type === 'heart' ? '#f43f5e' : item.type === 'freeze' ? '#38bdf8' : '#fbbf24';
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ctx.shadowColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          item.type === 'heart' ? '❤️' : item.type === 'freeze' ? '⏰' : '💣',
          0,
          0
        );
        ctx.restore();
      }

      // Bullets
      for (const b of stateRef.current.bullets) {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Laser trail
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + 12);
        ctx.stroke();
        ctx.restore();
      }

      // Target Orbs (The Math Numbers)
      for (const t of stateRef.current.targets) {
        ctx.save();
        ctx.translate(t.x, t.y);

        // Glowing outer shield
        ctx.shadowColor = t.glowColor;
        ctx.shadowBlur = 16;

        // Circular Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
        ctx.fill();

        // Outer Neon Ring
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Inner radar grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, t.radius - 8, 0, Math.PI * 2);
        ctx.stroke();

        // Candidate Number Text - High readability for children
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "Jua", "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Format large numbers with commas (e.g. 15,240)
        ctx.fillText(t.value.toLocaleString(), 0, 0);

        ctx.restore();
      }

      // Particles
      for (const p of stateRef.current.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Floating Texts
      for (const ft of stateRef.current.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 18px "Jua", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Player Spaceship (Airplane)
      const px = stateRef.current.playerX;
      const py = stateRef.current.playerY;

      ctx.save();
      ctx.translate(px, py);

      // Thruster flame particle
      const flameHeight = 16 + Math.random() * 8;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-8, 22);
      ctx.lineTo(8, 22);
      ctx.lineTo(0, 22 + flameHeight);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-4, 22);
      ctx.lineTo(4, 22);
      ctx.lineTo(0, 22 + flameHeight * 0.6);
      ctx.closePath();
      ctx.fill();

      // Wing glow
      ctx.shadowColor = shipModel.color;
      ctx.shadowBlur = 15;

      // Delta wings
      ctx.fillStyle = shipModel.color;
      ctx.beginPath();
      ctx.moveTo(0, -28); // nose
      ctx.lineTo(30, 22);  // right wing
      ctx.lineTo(12, 14);  // inner right
      ctx.lineTo(-12, 14); // inner left
      ctx.lineTo(-30, 22); // left wing
      ctx.closePath();
      ctx.fill();

      // Fuselage Cockpit
      ctx.fillStyle = shipModel.accentColor;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(10, 10);
      ctx.lineTo(0, 20);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();

      // Canopy Glass
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -6, 4.5, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Laser Cannons on wing tips
      ctx.fillStyle = shipModel.bulletColor;
      ctx.fillRect(-16, -10, 3, 16);
      ctx.fillRect(13, -10, 3, 16);

      ctx.restore();

      ctx.restore(); // Restore shake

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isPaused,
    isGameOver,
    showScratchpad,
    profile.autoShoot,
    profile.mode,
    currentProblem,
    lives,
    combo,
    maxCombo,
    score,
    questionHistory,
    shipModel,
    spawnTargetsForProblem,
    shootBullet
  ]);

  // Mouse & Touch control handlers on Canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isPaused || isGameOver || showScratchpad) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    stateRef.current.targetX = x;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isPaused || isGameOver || showScratchpad) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    stateRef.current.targetX = x;
    shootBullet();
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col overflow-hidden select-none">
      
      {/* TOP HUD: Current Problem Display, Score, Lives, Scratchpad button */}
      <header className="relative z-20 w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-3 py-2.5 sm:px-6 sm:py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          
          {/* Left: Player Profile & Lives */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPaused(true);
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="일시 정지"
            >
              <Pause className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs text-slate-400 font-bold font-jua flex items-center gap-1.5">
                <span>{profile.nickname}</span>
                {combo >= 2 && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-0.5 font-sans font-bold animate-pulse">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {combo} 콤보
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(4)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-all ${
                      i < lives
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-slate-700 fill-transparent scale-90'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center: Mission Math Question (Bold and Ultra Clear) */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider font-jua">
              🎯 정답 행성을 조준 사격하세요!
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black font-jua text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] tracking-wide">
              {currentProblem.displayQuestion}
            </div>
          </div>

          {/* Right: Score, Scratchpad, Sound */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold font-jua">현재 점수</div>
              <div className="text-lg sm:text-2xl font-black font-pixel text-cyan-300">
                {score.toLocaleString()}
              </div>
            </div>

            {/* Scratchpad Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowScratchpad(true);
              }}
              className="py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 font-jua text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="연습장 및 세로셈 풀이"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">풀이 연습장</span>
              <span className="sm:hidden">연습장</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const muted = soundManager.toggleMute();
                setSoundMuted(muted);
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={soundMuted ? '소리 켜기' : '소리 끄기'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

        </div>

        {/* Notice Message Toast */}
        {noticeMessage && (
          <div
            className={`py-1 px-3 rounded-lg text-xs font-jua text-center animate-fadeIn transition-all ${
              noticeMessage.type === 'correct'
                ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                : noticeMessage.type === 'wrong'
                ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
                : 'bg-amber-950/70 border border-amber-500/50 text-amber-300'
            }`}
          >
            {noticeMessage.text}
          </div>
        )}
      </header>

      {/* Main Game Canvas Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Mobile / Tablet On-Screen Controls */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none sm:hidden">
          {/* Steer left/right buttons for touch */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onTouchStart={() => (stateRef.current.keys.left = true)}
              onTouchEnd={() => (stateRef.current.keys.left = false)}
              onMouseDown={() => (stateRef.current.keys.left = true)}
              onMouseUp={() => (stateRef.current.keys.left = false)}
              className="w-14 h-14 rounded-2xl bg-slate-800/80 active:bg-cyan-600/80 border border-slate-700 text-white font-bold text-xl flex items-center justify-center active:scale-95 shadow-lg backdrop-blur-md"
            >
              ◀
            </button>
            <button
              onTouchStart={() => (stateRef.current.keys.right = true)}
              onTouchEnd={() => (stateRef.current.keys.right = false)}
              onMouseDown={() => (stateRef.current.keys.right = true)}
              onMouseUp={() => (stateRef.current.keys.right = false)}
              className="w-14 h-14 rounded-2xl bg-slate-800/80 active:bg-cyan-600/80 border border-slate-700 text-white font-bold text-xl flex items-center justify-center active:scale-95 shadow-lg backdrop-blur-md"
            >
              ▶
            </button>
          </div>

          {/* Fire button for touch */}
          <div className="pointer-events-auto">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                shootBullet();
              }}
              onClick={shootBullet}
              className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-amber-500 active:from-rose-500 active:to-amber-400 text-white font-jua text-sm font-bold flex flex-col items-center justify-center active:scale-90 shadow-xl shadow-rose-600/30 border-2 border-rose-300/40"
            >
              <span>발사!</span>
              <span className="text-[10px] text-amber-200">FIRE</span>
            </button>
          </div>
        </div>

      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-2xl font-black font-jua text-white">일시 정지</h3>
            <p className="text-xs text-slate-400">
              잠시 쉬어가는 시간! 준비가 되면 다시 출격하세요.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-jua text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>게임 계속하기</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                  onExit();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-jua text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>시작 화면으로 나가기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratchpad Modal */}
      {showScratchpad && (
        <ScratchpadModal
          problem={currentProblem}
          onClose={() => setShowScratchpad(false)}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          profile={profile}
          score={score}
          maxCombo={maxCombo}
          questionHistory={questionHistory}
          onPlayAgain={() => {
            setIsGameOver(false);
            setScore(0);
            setLives(3);
            setCombo(0);
            setQuestionHistory([]);
            const newProb = generateMathProblem(profile.mode);
            setCurrentProblem(newProb);
            const canvas = canvasRef.current;
            if (canvas) {
              spawnTargetsForProblem(newProb, canvas.clientWidth);
            }
          }}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onGoHome={onExit}
        />
      )}

      {/* Leaderboard Modal from Game Over */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

    </div>
  );
};
