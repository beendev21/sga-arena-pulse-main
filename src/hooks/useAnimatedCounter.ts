import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useAnimatedCounter(target: number, duration = 1.6) {
  const elRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el || target === 0) return

    const proxy = { value: 0 }

    const tween = gsap.to(proxy, {
      value: target,
      duration,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
      onUpdate() {
        if (el) el.textContent = String(Math.round(proxy.value))
      },
    })

    return () => {
      tween.kill()
      ScrollTrigger.getAll()
        .filter(t => t.vars.trigger === el)
        .forEach(t => t.kill())
    }
  }, [target, duration])

  return elRef
}
