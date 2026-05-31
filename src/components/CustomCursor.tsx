import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { usePreferences } from '@/store/preferences'

export function CustomCursor() {
  const [isTouch, setIsTouch] = useState(false)
  const cursor = usePreferences((s) => s.cursor)

  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true)
      return
    }

    if (cursor === 'system') {
      document.documentElement.classList.remove('custom-cursor')
      return
    }

    document.documentElement.classList.add('custom-cursor')

    const dot  = dotRef.current
    const ring = ringRef.current

    const onMove = (e: MouseEvent) => {
      if (dot) gsap.set(dot, { x: e.clientX, y: e.clientY })
      if (ring) {
        if (cursor === 'arena') {
          gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out' })
        } else {
          gsap.set(ring, { x: e.clientX, y: e.clientY })
        }
      }
    }

    const onEnter = () => {
      if (cursor === 'arena') {
        if (ring) gsap.to(ring, { scale: 1.8, borderColor: 'rgba(220,50,50,0.9)', duration: 0.2 })
        if (dot)  gsap.to(dot,  { scale: 0, duration: 0.15 })
      } else if (cursor === 'crosshair') {
        if (ring) gsap.to(ring, { scale: 1.4, opacity: 0.6, duration: 0.15 })
      } else if (cursor === 'dot') {
        if (dot) gsap.to(dot, { scale: 2.5, duration: 0.15 })
      }
    }

    const onLeave = () => {
      if (cursor === 'arena') {
        if (ring) gsap.to(ring, { scale: 1, borderColor: 'rgba(255,255,255,0.7)', duration: 0.2 })
        if (dot)  gsap.to(dot,  { scale: 1, duration: 0.15 })
      } else if (cursor === 'crosshair') {
        if (ring) gsap.to(ring, { scale: 1, opacity: 1, duration: 0.15 })
      } else if (cursor === 'dot') {
        if (dot) gsap.to(dot, { scale: 1, duration: 0.15 })
      }
    }

    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea, [tabindex]')
        .forEach(el => {
          el.addEventListener('mouseenter', onEnter)
          el.addEventListener('mouseleave', onLeave)
        })
    }

    window.addEventListener('mousemove', onMove)
    addListeners()

    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.classList.remove('custom-cursor')
      observer.disconnect()
    }
  }, [cursor])

  if (isTouch || cursor === 'system') return null

  if (cursor === 'dot') {
    return (
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 10, height: 10,
        background: 'white', borderRadius: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none', zIndex: 99999,
        mixBlendMode: 'difference',
      }} />
    )
  }

  if (cursor === 'crosshair') {
    return (
      <>
        <div ref={dotRef} style={{
          position: 'fixed', top: 0, left: 0, width: 4, height: 4,
          background: 'rgba(255,255,255,0.9)', borderRadius: '50%',
          transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99999,
        }} />
        <div ref={ringRef} style={{
          position: 'fixed', top: 0, left: 0, width: 28, height: 28,
          transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99998,
        }}>
          {([[-12,0,8,1],[4,0,8,1],[0,-12,1,8],[0,4,1,8]] as [number,number,number,number][]).map(([x,y,w,h],i) => (
            <div key={i} style={{ position:'absolute', left:`calc(50% + ${x}px)`, top:`calc(50% + ${y}px)`, width:w, height:h, background:'rgba(255,255,255,0.85)' }} />
          ))}
        </div>
      </>
    )
  }

  // arena
  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, width: 6, height: 6,
        background: '#ffffff', borderRadius: '50%',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        zIndex: 99999, mixBlendMode: 'difference',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, width: 32, height: 32,
        border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: '50%',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99998,
      }}>
        {([[-7,'50%',1,5],['50%',-7,5,1]] as any[]).map((_,i) => [1,-1].map(dir => (
          <div key={`${i}${dir}`} style={{
            position:'absolute',
            ...(i===0 ? { left:'50%', [dir>0?'top':'bottom']: -7, width:1, height:5, transform:'translateX(-50%)' }
                       : { top:'50%',  [dir>0?'left':'right']: -7, width:5, height:1, transform:'translateY(-50%)' })
          }} className="bg-white/70" />
        )))}
      </div>
    </>
  )
}
