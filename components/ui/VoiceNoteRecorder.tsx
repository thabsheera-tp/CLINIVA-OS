'use client'

import React, { useState, useEffect, useRef } from 'react'

interface VoiceNoteRecorderProps {
  onAppendNote?: (text: string, targetSection?: string) => void
  className?: string
}

// Window declaration for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function VoiceNoteRecorder({ onAppendNote, className = '' }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  const [activeTarget, setActiveTarget] = useState<'subjective' | 'plan' | 'objective'>('subjective')

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let current = ''
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript + ' '
      }
      setTranscript(current.trim())
    }

    recognition.onerror = (event: any) => {
      console.warn('[VoiceNoteRecorder] Speech error:', event.error)
      if (event.error === 'not-allowed') {
        setIsRecording(false)
      }
    }

    recognition.onend = () => {
      // Auto-restart if user hasn't explicitly stopped
      if (isRecording) {
        try {
          recognition.start()
        } catch {}
      }
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const toggleRecording = () => {
    if (isRecording) {
      // Stop
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      try {
        recognitionRef.current?.stop()
      } catch {}
    } else {
      // Start
      setTranscript('')
      setDuration(0)
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)

      try {
        recognitionRef.current?.start()
      } catch (err) {
        console.warn('SpeechRecognition start failed, trying fallback:', err)
      }
    }
  }

  const handleAppend = () => {
    if (!transcript) return
    onAppendNote?.(transcript, activeTarget)
    setTranscript('')
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className={`p-3 bg-surface-container-low/70 rounded-xl border border-outline-variant/30 space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-primary text-on-primary hover:bg-primary-container hover-lift'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Clinical Voice Dictation'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRecording ? 'mic' : 'mic_none'}
            </span>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-label-sm font-semibold text-on-surface">
                {isRecording ? 'Listening & Dictating...' : 'Clinical Voice Note'}
              </span>
              {isRecording && (
                <span className="font-mono text-label-sm text-red-500 font-bold tabular-nums">
                  {formatTime(duration)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant">
              {isRecording
                ? 'Speak clearly into your microphone'
                : isSupported
                ? 'Click mic to dictate clinical notes'
                : 'Browser speech recognition not available'}
            </p>
          </div>
        </div>

        {transcript && (
          <div className="flex items-center gap-1.5">
            <select
              value={activeTarget}
              onChange={(e) => setActiveTarget(e.target.value as any)}
              className="text-label-sm py-1 px-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface"
            >
              <option value="subjective">+ Subjective (S)</option>
              <option value="objective">+ Objective (O)</option>
              <option value="plan">+ Plan (P)</option>
            </select>

            <button
              type="button"
              onClick={handleAppend}
              className="btn-primary text-label-sm py-1 px-2.5 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Insert</span>
            </button>
          </div>
        )}
      </div>

      {/* Real-time speech transcript box */}
      {(isRecording || transcript) && (
        <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-primary/20 text-body-sm text-on-surface flex items-start justify-between gap-2">
          <p className="italic leading-relaxed flex-1">
            &ldquo;{transcript || 'Listening for speech...'}&rdquo;
          </p>
          {transcript && (
            <button
              type="button"
              onClick={() => setTranscript('')}
              className="text-outline hover:text-on-surface p-1"
              title="Clear transcript"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
