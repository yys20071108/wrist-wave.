'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipForward, SkipBack, Music, Video, ImageIcon, Mic, Settings, Info, ChevronLeft, List, Moon, Sun, Volume2, VolumeX, Repeat, Shuffle, Maximize2, Minimize2, StopCircle, GripVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }

  .anime-mode {
    background-image: url('/anime-background.jpg');
    background-size: cover;
    background-position: center;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    animation: sparkle 2s infinite;
  }

  @keyframes sparkle {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  .anime-mode button {
    border-radius: 20px;
    background-color: #ff9999;
    color: #ffffff;
    transition: all 0.3s ease;
  }

  .anime-mode button:hover {
    transform: scale(1.1);
    background-color: #ff6666;
  }

  .anime-mode .layout-默认 {
    /* 默认布局样式 */
  }

  .anime-mode .layout-紧凑 {
    max-width: 180px;
  }

  .anime-mode .layout-展开 {
    max-width: 240px;
  }

  @media (max-width: 640px) {
    .anime-mode {
      padding: 2rem;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .anime-mode {
      padding: 3rem;
    }
  }

  @media (min-width: 1025px) {
    .anime-mode {
      padding: 4rem;
    }
  }
`

type MediaItem = {
  id: number;
  type: '音乐' | '视频' | '图片' | '录音';
  name: string;
  url: string;
}

type Page = '主页' | '音乐' | '视频' | '图片' | '录音' | '设置' | '关于' | '播放列表';

export default function WristWave() {
  const [currentPage, setCurrentPage] = useState<Page>('主页')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(50)
  const [playlist, setPlaylist] = useState<MediaItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [repeatMode, setRepeatMode] = useState<'关闭' | '全部重复' | '单曲重复'>('关闭')
  const [isShuffle, setIsShuffle] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [musicQuality, setMusicQuality] = useState<'低' | '中' | '高'>('中')
  const [videoQuality, setVideoQuality] = useState<'360p' | '720p' | '1080p'>('720p')
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png' | 'webp'>('jpg')
  const [recordingFormat, setRecordingFormat] = useState<'mp3' | 'wav'>('mp3')
  const [defaultMusicFolder, setDefaultMusicFolder] = useState('')
  const [defaultVideoFolder, setDefaultVideoFolder] = useState('')
  const [defaultImageFolder, setDefaultImageFolder] = useState('')
  const [defaultRecordingFolder, setDefaultRecordingFolder] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [enableFullscreen, setEnableFullscreen] = useState(true)
  const [appLayout, setAppLayout] = useState<'默认' | '紧凑' | '展开'>('默认')
  const [showMusicName, setShowMusicName] = useState(true)
  const [autoPause, setAutoPause] = useState(true)
  const [crossfadeTime, setCrossfadeTime] = useState(2)
  const [equalizerPreset, setEqualizerPreset] = useState('平衡')
  const [gaplessPlayback, setGaplessPlayback] = useState(false)
  const [bufferingStrategy, setBufferingStrategy] = useState('自动')
  const [offlineMode, setOfflineMode] = useState(true)
  const [enableDragDrop, setEnableDragDrop] = useState(false)
  const [enableGestureControl, setEnableGestureControl] = useState(false)
  const [enableHotReload, setEnableHotReload] = useState(false)
  const [enableAutoUpdate, setEnableAutoUpdate] = useState(true)
  const [enableBatteryOptimization, setEnableBatteryOptimization] = useState(true)
  const [enableDataSaving, setEnableDataSaving] = useState(false)
  const [fontSizeAdjustment, setFontSizeAdjustment] = useState(0)
  const [isAnimeMode, setIsAnimeMode] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
    document.body.classList.toggle('anime-mode', isAnimeMode)
    document.documentElement.style.fontSize = `${16 + fontSizeAdjustment}px`
  }, [isDarkMode, isAnimeMode, fontSizeAdjustment])

  const handlePlayPause = useCallback(() => {
    if (currentPage === '音乐' && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play()
    } else if (currentPage === '视频' && videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [currentPage, isPlaying])

  const handleRecord = useCallback(() => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream)
          mediaRecorderRef.current = mediaRecorder
          recordedChunksRef.current = []

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data)
            }
          }

          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
            const url = URL.createObjectURL(blob)
            const newRecording: MediaItem = {
              id: Date.now(),
              type: '录音',
              name: `录音 ${playlist.length + 1}`,
              url: url
            }
            setPlaylist(prevPlaylist => [...prevPlaylist, newRecording])
            toast({
              title: '录音已保存',
              duration: 3000,
            })
          }

          mediaRecorder.start()
        })
        .catch(error => {
          console.error('访问麦克风时出错:', error)
          toast({
            title: '无法访问麦克风',
            description: '请确保您已授予麦克风访问权限',
            duration: 3000,
          })
        })
    }
    setIsRecording(!isRecording)
    toast({
      title: isRecording ? '停止录音' : '开始录音',
      duration: 3000,
    })
  }, [isRecording, playlist.length])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPlaylist: MediaItem[] = Array.from(files).filter(file => 
        file.type.startsWith('audio') || file.type.startsWith('video') || file.type.startsWith('image')
      ).map((file, index) => ({
        id: Date.now() + index,
        type: file.type.startsWith('audio') ? '音乐' : file.type.startsWith('video') ? '视频' : '图片',
        name: file.name,
        url: URL.createObjectURL(file)
      }))
      setPlaylist(prevPlaylist => [...prevPlaylist, ...newPlaylist])
      if (!currentMedia) {
        setCurrentMedia(newPlaylist[0])
        setCurrentIndex(playlist.length)
      }
      toast({
        title: `已添加 ${newPlaylist.length} 个文件`,
        duration: 3000,
      })
    }
  }, [currentMedia, playlist.length])

  const handleNext = useCallback(() => {
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * playlist.length)
      setCurrentIndex(nextIndex)
      setCurrentMedia(playlist[nextIndex])
    } else if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1)
      setCurrentMedia(playlist[currentIndex + 1])
    } else if (repeatMode === '全部重复') {
      setCurrentIndex(0)
      setCurrentMedia(playlist[0])
    }
    setIsPlaying(true)
  }, [isShuffle, playlist, currentIndex, repeatMode])

  const handlePrevious = useCallback(() => {
    if (isShuffle) {
      const prevIndex = Math.floor(Math.random() * playlist.length)
      setCurrentIndex(prevIndex)
      setCurrentMedia(playlist[prevIndex])
    } else if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1)
      setCurrentMedia(playlist[currentIndex - 1])
    } else if (repeatMode === '全部重复') {
      setCurrentIndex(playlist.length - 1)
      setCurrentMedia(playlist[playlist.length - 1])
    }
    setIsPlaying(true)
  }, [isShuffle, playlist, currentIndex, repeatMode])

  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => !prevMuted)
    if (audioRef.current) audioRef.current.muted = !isMuted
    if (videoRef.current) videoRef.current.muted = !isMuted
    toast({
      title: isMuted ? '取消静音' : '静音',
      duration: 3000,
    })
  }, [isMuted])

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prevShuffle => !prevShuffle)
    toast({
      title: isShuffle ? '关闭随机播放' : '开启随机播放',
      duration: 3000,
    })
  }, [isShuffle])

  useEffect(() => {
    const updateProgress = () => {
      if (currentPage === '音乐' && audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
      } else if (currentPage === '视频' && videoRef.current) {
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
      }
    }

    const interval = setInterval(updateProgress, 1000)
    return () => clearInterval(interval)
  }, [currentPage])

  const handleFolderSelect = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        setter(files[0].path)
      }
    })
    input.click()
  }

  const toggleFullscreen = () => {
    if (!enableFullscreen) return
    setIsFullscreen(!isFullscreen)
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(playlist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPlaylist(items);
    setCurrentIndex(result.destination.index);
    setCurrentMedia(items[result.destination.index]);
  };

  const renderMainPage = () => (
    <div className="grid grid-cols-2 gap-4">
      <Button onClick={() => setCurrentPage('音乐')}>
        <Music className="h-8 w-8" />
        音乐
      </Button>
      <Button onClick={() => setCurrentPage('视频')}>
        <Video className="h-8 w-8" />
        视频
      </Button>
      <Button onClick={() => setCurrentPage('图片')}>
        <ImageIcon className="h-8 w-8" />
        图片
      </Button>
      <Button onClick={() => setCurrentPage('录音')}>
        <Mic className="h-8 w-8" />
        录音
      </Button>
      <Button onClick={() => setCurrentPage('设置')}>
        <Settings className="h-8 w-8" />
        设置
      </Button>
      <Button onClick={() => setCurrentPage('关于')}>
        <Info className="h-8 w-8" />
        关于
      </Button>
    </div>
  )

  const renderMediaPlayer = () => (
    <>
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogTrigger asChild>
          <div className="w-full h-24 bg-gray-800 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden" onClick={toggleFullscreen}>
            {currentPage === '音乐' && (
              <audio 
                ref={audioRef} 
                src={currentMedia?.url} 
                onEnded={() => {
                  if (repeatMode === '单曲重复') {
                    audioRef.current?.play()
                  } else {
                    handleNext()
                  }
                }} 
              />
            )}
            {currentPage === '视频' && (
              <video 
                ref={videoRef} 
                src={currentMedia?.url} 
                className="w-full h-full object-cover" 
                onEnded={() => {
                  if (repeatMode === '单曲重复') {
                    videoRef.current?.play()
                  } else {
                    handleNext()
                  }
                }}
              />
            )}
            {currentPage === '图片' && currentMedia && (
              <img src={currentMedia.url} alt={currentMedia.name} className="w-full h-full object-cover" />
            )}
            {currentPage === '录音' && (
              isRecording ? <StopCircle className="h-12 w-12 text-red-500" /> : <Mic className="h-12 w-12" />
            )}
            {!currentMedia && currentPage !== '录音' && (
              <div className="text-center text-sm">
                {currentPage === '音乐' ? '选择音乐' : currentPage === '视频' ? '选择视频' : currentPage === '图片' ? '选择图片' : '准备录音'}
              </div>
            )}
            {currentMedia && showMusicName && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-white/90 px-2 truncate max-w-full">
                  {currentMedia.name}
                </span>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-full max-h-full p-0">
          {currentPage === '视频' && currentMedia && (
            <video 
              ref={videoRef} 
              src={currentMedia.url} 
              className="w-full h-full object-contain" 
              controls
              autoPlay
            />
          )}
          {currentPage === '图片' && currentMedia && (
            <img src={currentMedia.url} alt={currentMedia.name} className="w-full h-full object-contain" />
          )}
        </DialogContent>
      </Dialog>

      <div className="w-full mb-4">
        <Slider
          value={[progress]}
          max={100}
          step={1}
          onValueChange={(value) => {
            if (currentPage === '音乐' && audioRef.current) {
              audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration
            } else if (currentPage === '视频' && videoRef.current) {
              videoRef.current.currentTime = (value[0] / 100) * videoRef.current.duration
            }
          }}
        />
      </div>
      <div className="flex justify-between w-full">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="default" size="icon" onClick={currentPage === '录音' ? handleRecord : handlePlayPause}>
          {currentPage === '录音' ? (
            isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />
          ) : (
            isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between w-full mt-4">
        <div className="relative group">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-background border rounded-md p-2 w-32">
            <div className="text-center mb-1">{volume}%</div>
            <Slider
              className="volume-slider"
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0])
                if (audioRef.current) audioRef.current.volume = value[0] / 100
                if (videoRef.current) videoRef.current.volume = value[0] / 100
              }}
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleShuffle}>
          <Shuffle className={`h-4 w-4 ${isShuffle ? 'text-primary' : ''}`} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setRepeatMode(repeatMode === '关闭' ? '全部重复' : repeatMode === '全部重复' ? '单曲重复' : '关闭')}>
          <Repeat className={`h-4 w-4 ${repeatMode !== '关闭' ? 'text-primary' : ''}`} />
          {repeatMode === '单曲重复' && <span className="absolute text-[10px] font-bold">1</span>}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage('播放列表')}>
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between w-full mt-4">
        <input
          type="file"
          accept={currentPage === '音乐' ? '.mp3' : currentPage === '视频' ? '.mp4' : '.jpg,.png'}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          选择文件
        </Button>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleFullscreen} disabled={!enableFullscreen}>
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
    </>
  )

  const renderPlaylist = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="playlist">
        {(provided) => (
          <ScrollArea className="h-[300px] w-full" {...provided.droppableProps} ref={provided.innerRef}>
            {playlist.map((item, index) => (
              <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index} isDragDisabled={!enableDragDrop}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex items-center ${index === currentIndex ? 'bg-primary' : ''}`}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setCurrentMedia(item)
                        setCurrentIndex(index)
                        setIsPlaying(true)
                        setCurrentPage(item.type === '录音' ? '音乐' : item.type)
                      }}
                    >
                      {item.type === '音乐' && <Music className="h-4 w-4 mr-2" />}
                      {item.type === '视频' && <Video className="h-4 w-4 mr-2" />}
                      {item.type === '图片' && <ImageIcon className="h-4 w-4 mr-2" />}
                      {item.type === '录音' && <Mic className="h-4 w-4 mr-2" />}
                      {item.name}
                    </Button>
                    {enableDragDrop && <GripVertical className="h-4 w-4 ml-2" />}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ScrollArea>
        )}
      </Droppable>
    </DragDropContext>
  )

  const renderSettingsPage = () => (
    <ScrollArea className="h-[300px] w-full">
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">常规设置</h3>
          <div className="flex items-center justify-between">
            <span>深色模式</span>
            <Switch 
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>二次元模式</span>
            <Switch 
              checked={isAnimeMode}
              onCheckedChange={setIsAnimeMode}
            />
          </div>
          <div className="space-y-2">
            <span>音量</span>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0])
                if (audioRef.current) audioRef.current.volume = value[0] / 100
                if (videoRef.current) videoRef.current.volume = value[0] / 100
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>自动播放</span>
            <Switch 
              checked={autoPlay}
              onCheckedChange={setAutoPlay}
            />
          </div>
          <div className="space-y-2">
            <span>重复模式</span>
            <Select value={repeatMode} onValueChange={(value: '关闭' | '全部重复' | '单曲重复') => setRepeatMode(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择重复模式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="关闭">关闭</SelectItem>
                <SelectItem value="全部重复">全部重复</SelectItem>
                <SelectItem value="单曲重复">单曲重复</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span>显示音乐名字</span>
            <Switch 
              checked={showMusicName}
              onCheckedChange={setShowMusicName}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>耳机拔出时自动暂停</span>
            <Switch 
              checked={autoPause}
              onCheckedChange={setAutoPause}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">音乐设置</h3>
          <div className="space-y-2">
            <span>音质</span>
            <Select value={musicQuality} onValueChange={(value: '低' | '中' | '高') => setMusicQuality(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择音质" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="低">低质量</SelectItem>
                <SelectItem value="中">中等质量</SelectItem>
                <SelectItem value="高">高质量</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultMusicFolder">默认音乐文件夹</Label>
            <Input
              id="defaultMusicFolder"
              value={defaultMusicFolder}
              onChange={(e) => setDefaultMusicFolder(e.target.value)}
              placeholder="输入默认音乐文件夹路径"
            />
            <Button onClick={() => handleFolderSelect(setDefaultMusicFolder)}>选择</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">视频设置</h3>
          <div className="space-y-2">
            <span>视频质量</span>
            <Select value={videoQuality} onValueChange={(value: '360p' | '720p' | '1080p') => setVideoQuality(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择视频质量" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="360p">360p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultVideoFolder">默认视频文件夹</Label>
            <Input
              id="defaultVideoFolder"
              value={defaultVideoFolder}
              onChange={(e) => setDefaultVideoFolder(e.target.value)}
              placeholder="输入默认视频文件夹路径"
            />
            <Button onClick={() => handleFolderSelect(setDefaultVideoFolder)}>选择</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">图片设置</h3>
          <div className="space-y-2">
            <span>图片格式</span>
            <Select value={imageFormat} onValueChange={(value: 'jpg' | 'png' | 'webp') => setImageFormat(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择图片格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultImageFolder">默认图片文件夹</Label>
            <Input
              id="defaultImageFolder"
              value={defaultImageFolder}
              onChange={(e) => setDefaultImageFolder(e.target.value)}
              placeholder="输入默认图片文件夹路径"
            />
            <Button onClick={() => handleFolderSelect(setDefaultImageFolder)}>选择</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">录音设置</h3>
          <div className="space-y-2">
            <span>录音格式</span>
            <Select value={recordingFormat} onValueChange={(value: 'mp3' | 'wav') => setRecordingFormat(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择录音格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="wav">WAV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultRecordingFolder">默认录音文件夹</Label>
            <Input
              id="defaultRecordingFolder"
              value={defaultRecordingFolder}
              onChange={(e) => setDefaultRecordingFolder(e.target.value)}
              placeholder="输入默认录音文件夹路径"
            />
            <Button onClick={() => handleFolderSelect(setDefaultRecordingFolder)}>选择</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">全屏设置</h3>
          <div className="flex items-center justify-between">
            <span>启用全屏模式</span>
            <Switch 
              checked={enableFullscreen}
              onCheckedChange={setEnableFullscreen}
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">应用布局</h3>
          <Select value={appLayout} onValueChange={(value: '默认' | '紧凑' | '展开') => setAppLayout(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择应用布局" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="默认">默认布局</SelectItem>
              <SelectItem value="紧凑">紧凑布局</SelectItem>
              <SelectItem value="展开">展开布局</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">高级设置</h3>
          <div className="space-y-2">
            <Label htmlFor="crossfadeTime">交叉淡入淡出时间（秒）</Label>
            <Input
              id="crossfadeTime"
              type="number"
              value={crossfadeTime}
              onChange={(e) => setCrossfadeTime(Number(e.target.value))}
              min={0}
              max={10}
            />
          </div>
          <div className="space-y-2">
            <span>均衡器预设</span>
            <Select value={equalizerPreset} onValueChange={setEqualizerPreset}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择均衡器预设" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="平衡">平衡</SelectItem>
                <SelectItem value="摇滚">摇滚</SelectItem>
                <SelectItem value="流行">流行</SelectItem>
                <SelectItem value="爵士">爵士</SelectItem>
                <SelectItem value="古典">古典</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span>无缝播放</span>
            <Switch 
              checked={gaplessPlayback}
              onCheckedChange={setGaplessPlayback}
            />
          </div>
          <div className="space-y-2">
            <span>缓冲策略</span>
            <Select value={bufferingStrategy} onValueChange={setBufferingStrategy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择缓冲策略" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="自动">自动</SelectItem>
                <SelectItem value="激进">激进</SelectItem>
                <SelectItem value="保守">保守</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span>离线模式</span>
            <Switch 
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>启用播放列表排序</span>
            <Switch 
              checked={enableDragDrop}
              onCheckedChange={setEnableDragDrop}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>启用手势控制</span>
            <Switch 
              checked={enableGestureControl}
              onCheckedChange={setEnableGestureControl}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>启用热更新</span>
            <Switch 
              checked={enableHotReload}
              onCheckedChange={setEnableHotReload}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>启用自动更新</span>
            <Switch 
              checked={enableAutoUpdate}
              onCheckedChange={setEnableAutoUpdate}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>启用电池优化</span>
            <Switch 
              checked={enableBatteryOptimization}
              onCheckedChange={setEnableBatteryOptimization}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>启用数据节省模式</span>
            <Switch 
              checked={enableDataSaving}
              onCheckedChange={setEnableDataSaving}
            />
          </div>
          <div className="space-y-2">
            <span>字体大小调整</span>
            <Slider
              value={[fontSizeAdjustment]}
              min={-4}
              max={4}
              step={1}
              onValueChange={(value) => setFontSizeAdjustment(value[0])}
            />
            <div className="text-sm text-muted-foreground">
              当前字体大小: {16 + fontSizeAdjustment}px
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )

  const renderAboutPage = () => (
    <ScrollArea className="h-[300px]">
      <div className="flex flex-col items-center justify-between h-full p-4">
        <div className="text-center">
          <Music className="h-24 w-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">腕波</h2>
          <p className="text-sm text-muted-foreground">您的随身音乐伴侣</p>
        </div>
        <div className="space-y-4 text-center">
          <h3 className="font-bold">隐私政策</h3>
          <p className="text-sm">
            腕波尊重用户的隐私，并致力于保护个人信息。
            收集的信息仅用于提供和改善服务，不会与第三方共享。
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          版本：1.1.0
        </div>
      </div>
    </ScrollArea>
  )

  useEffect(() => {
    if (enableGestureControl) {
      let touchStartX = 0;
      let touchStartY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 50) {
            handlePrevious();
          } else if (deltaX < -50) {
            handleNext();
          }
        } else {
          if (deltaY > 50) {
            setVolume(prev => Math.max(0, prev - 10));
          } else if (deltaY < -50) {
            setVolume(prev => Math.min(100, prev + 10));
          }
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [enableGestureControl, handleNext, handlePrevious]);

  return (
    <>
      <GlobalStyle />
      <div className={`flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 max-w-[200px] mx-auto relative ${isDarkMode ? 'dark' : ''} ${isAnimeMode ? 'anime-mode' : ''} layout-${appLayout} text-base`}>
        <h1 className="text-2xl font-bold mb-4">腕波</h1>
        
        {currentPage !== '主页' && (
          <Button variant="ghost" size="icon" className="self-start mb-4" onClick={() => setCurrentPage('主页')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {currentPage === '主页' && renderMainPage()}
        {['音乐', '视频', '图片', '录音'].includes(currentPage) && renderMediaPlayer()}
        {currentPage === '播放列表' && renderPlaylist()}
        {currentPage === '设置' && renderSettingsPage()}
        {currentPage === '关于' && renderAboutPage()}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </>
  )
}