import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Pause, Play, Repeat, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from './useSceneControls';

const SCENE_DETAILS = [
  ['The Next Best Action', 'src/components/video/video_scenes/Scene1.tsx'],
  ['Meet CareReward', 'src/components/video/video_scenes/Scene2.tsx'],
  ['Take Action', 'src/components/video/video_scenes/Scene3.tsx'],
  ['Earn Rewards', 'src/components/video/video_scenes/Scene4.tsx'],
  ['Better Health, Lower Costs', 'src/components/video/video_scenes/Scene5.tsx'],
] as const;

const formatTime = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

function PlaybackStatus(props: {
  keys: string[]; active: number; duration: number; start: number; total: number;
  tick: number; paused: boolean; onJump: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const base = useRef(0);
  useEffect(() => { setElapsed(0); base.current = 0; }, [props.tick]);
  useEffect(() => {
    if (props.paused) return;
    const start = performance.now();
    const id = window.setInterval(() => setElapsed(base.current + performance.now() - start), 60);
    return () => { clearInterval(id); base.current += performance.now() - start; };
  }, [props.paused, props.tick]);
  const progress = props.duration ? Math.min(1, elapsed / props.duration) : 0;
  return <>
    <div className="flex flex-1 items-center gap-1.5">
      {props.keys.map((key, index) => <button key={key} onClick={() => props.onJump(index)}
        aria-label={`Jump to scene ${index + 1}`} className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/20">
        <span className="absolute inset-y-0 left-0 rounded-full bg-white/90"
          style={{ width: `${index === props.active ? progress * 100 : 0}%` }} />
      </button>)}
    </div>
    <span className="font-mono text-xl text-white/60">{props.active + 1}/{props.keys.length}</span>
    <span className="min-w-[11ch] text-right font-mono text-xl text-white/80">
      {formatTime(props.start + Math.min(elapsed, props.duration))} / {formatTime(props.total)}
    </span>
  </>;
}

export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;
  const controls = useSceneControls(SCENE_DURATIONS);
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);
  const sensorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!controls.paused) return;
    const animations = document.getAnimations().filter((animation) => animation.playState === 'running');
    animations.forEach((animation) => animation.pause());
    return () => animations.forEach((animation) => animation.play());
  }, [controls.paused]);

  const jumpTo = useCallback((index: number) => {
    controls.jumpTo(index);
    window.parent.postMessage({ type: 'REPLIT_VIDEO_SCENE_SELECTED', payload: {
      sceneIndex: index, sceneCount: controls.sceneKeys.length,
      sceneTitle: SCENE_DETAILS[index][0], filePath: SCENE_DETAILS[index][1], lineNumber: 1,
    } }, '*');
  }, [controls]);

  if (!isIframed) return <VideoTemplate />;
  const visible = !collapsed || hovering || tapPinned;
  return <div className="relative h-screen w-full">
    <VideoTemplate key={controls.mountKey} durations={controls.durations} paused={controls.paused}
      muted={muted} onSceneChange={controls.onSceneChange} />
    <div ref={sensorRef} className="absolute inset-x-0 bottom-0 z-50 flex h-1/4 flex-col justify-end"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovering(false)}
      onPointerDown={(e) => e.pointerType !== 'mouse' && collapsed && setTapPinned(true)}>
      <div className="flex-1" />
      <div className={`flex items-center gap-3 bg-black/50 px-5 py-4 backdrop-blur-sm transition-all ${visible ? '' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <button onClick={controls.togglePause} className="flex h-14 w-14 items-center justify-center text-white" aria-label={controls.paused ? 'Play' : 'Pause'}>
          {controls.paused ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
        </button>
        <button onClick={controls.toggleLock} className={`flex h-14 w-14 items-center justify-center rounded-lg ${controls.locked ? 'bg-white/15 text-white' : 'text-white/60'}`} aria-label="Loop current scene">
          <Repeat className="h-8 w-8" />
        </button>
        <button onClick={() => setMuted((value) => !value)} className="flex h-14 w-14 items-center justify-center text-white/60" aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
        </button>
        <div className="w-px self-stretch bg-white/15" />
        <PlaybackStatus keys={controls.sceneKeys} active={controls.activeIndex}
          duration={controls.activeDuration} start={controls.activeStartTime}
          total={controls.totalDuration} tick={controls.tick} paused={controls.paused} onJump={jumpTo} />
        <button onClick={() => { setCollapsed((value) => !value); setHovering(false); setTapPinned(false); }}
          className="flex h-14 w-14 items-center justify-center text-white/60" aria-label={collapsed ? 'Show controls' : 'Hide controls'}>
          {collapsed ? <ChevronUp className="h-10 w-10" /> : <ChevronDown className="h-10 w-10" />}
        </button>
      </div>
    </div>
  </div>;
}