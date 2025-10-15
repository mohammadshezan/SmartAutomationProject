"use client"

import { useEffect, useRef } from "react"

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const ships = Array.from({ length: 3 }, (_, i) => ({
      x: -300 + i * 600,
      y: canvas.height * 0.6 + Math.sin(i * 0.8) * 30,
      baseY: canvas.height * 0.6 + Math.sin(i * 0.8) * 30,
      speed: 0.4 + Math.random() * 0.3,
      length: 120 + Math.random() * 80,
      width: 25 + Math.random() * 15,
      bobOffset: Math.random() * Math.PI * 2,
      bobSpeed: 0.015 + Math.random() * 0.01,
      bobAmplitude: 2 + Math.random() * 3,
      rollOffset: Math.random() * Math.PI * 2,
      rollSpeed: 0.008 + Math.random() * 0.005,
      rollAmplitude: 0.05 + Math.random() * 0.03,
      type: Math.floor(Math.random() * 3), // 0: cargo, 1: tanker, 2: container
      wakeParticles: Array.from({ length: 15 }, (_, j) => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: Math.random(),
        maxLife: 80 + Math.random() * 60,
        size: 1 + Math.random() * 2,
      })),
      bowWave: Array.from({ length: 8 }, (_, j) => ({
        x: 0,
        y: 0,
        angle: 0,
        life: Math.random() * 40,
        maxLife: 40,
      })),
    }))

    const waterWaves = Array.from({ length: 50 }, (_, i) => ({
      x: (i / 50) * canvas.width,
      baseY: canvas.height * 0.65,
      amplitude: 3 + Math.random() * 4,
      frequency: 0.01 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.01,
    }))

    const atmosphericParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.1,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.3 + 0.1,
      life: Math.random() * 200 + 100,
      maxLife: 300,
    }))

    const drawRealisticShip = (ship: any, time: number) => {
      const bobbing = Math.sin(time * ship.bobSpeed + ship.bobOffset) * ship.bobAmplitude
      const rolling = Math.sin(time * ship.rollSpeed + ship.rollOffset) * ship.rollAmplitude
      const shipY = ship.baseY + bobbing

      ctx.save()
      ctx.translate(ship.x + ship.length / 2, shipY + ship.width / 2)
      ctx.rotate(rolling)
      ctx.translate(-ship.length / 2, -ship.width / 2)

      ctx.save()
      ctx.globalAlpha = 0.2
      ctx.fillStyle = "#1e3a8a"
      ctx.beginPath()
      ctx.ellipse(ship.length / 2, ship.width + 5, ship.length * 0.6, ship.width * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      if (ship.type === 0) {
        // Hull
        ctx.fillStyle = "#dc2626"
        ctx.beginPath()
        ctx.moveTo(0, ship.width * 0.7)
        ctx.quadraticCurveTo(ship.length * 0.1, ship.width, ship.length * 0.9, ship.width)
        ctx.quadraticCurveTo(ship.length, ship.width * 0.8, ship.length, ship.width * 0.5)
        ctx.lineTo(ship.length * 0.95, ship.width * 0.3)
        ctx.lineTo(ship.length * 0.05, ship.width * 0.3)
        ctx.closePath()
        ctx.fill()

        // Deck
        ctx.fillStyle = "#7f1d1d"
        ctx.fillRect(ship.length * 0.05, ship.width * 0.25, ship.length * 0.9, ship.width * 0.1)

        // Superstructure
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(ship.length * 0.75, ship.width * 0.05, ship.length * 0.2, ship.width * 0.25)

        // Bridge
        ctx.fillStyle = "#e5e7eb"
        ctx.fillRect(ship.length * 0.78, ship.width * 0.02, ship.length * 0.14, ship.width * 0.08)

        // Cargo holds
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = "#374151"
          ctx.fillRect(ship.length * (0.1 + i * 0.15), ship.width * 0.15, ship.length * 0.12, ship.width * 0.15)
        }

        // Cranes
        ctx.strokeStyle = "#6b7280"
        ctx.lineWidth = 2
        for (let i = 0; i < 3; i++) {
          const craneX = ship.length * (0.2 + i * 0.2)
          ctx.beginPath()
          ctx.moveTo(craneX, ship.width * 0.3)
          ctx.lineTo(craneX, ship.width * 0.05)
          ctx.lineTo(craneX + ship.length * 0.1, ship.width * 0.1)
          ctx.stroke()
        }
      } else if (ship.type === 1) {
        // Hull
        ctx.fillStyle = "#059669"
        ctx.beginPath()
        ctx.moveTo(0, ship.width * 0.7)
        ctx.quadraticCurveTo(ship.length * 0.1, ship.width, ship.length * 0.9, ship.width)
        ctx.quadraticCurveTo(ship.length, ship.width * 0.8, ship.length, ship.width * 0.5)
        ctx.lineTo(ship.length * 0.95, ship.width * 0.2)
        ctx.lineTo(ship.length * 0.05, ship.width * 0.2)
        ctx.closePath()
        ctx.fill()

        // Tank sections
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = "#065f46"
          ctx.beginPath()
          ctx.ellipse(
            ship.length * (0.15 + i * 0.15),
            ship.width * 0.4,
            ship.length * 0.06,
            ship.width * 0.15,
            0,
            0,
            Math.PI * 2,
          )
          ctx.fill()
        }

        // Superstructure
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(ship.length * 0.8, ship.width * 0.05, ship.length * 0.15, ship.width * 0.2)
      } else {
        // Hull
        ctx.fillStyle = "#1e40af"
        ctx.beginPath()
        ctx.moveTo(0, ship.width * 0.7)
        ctx.quadraticCurveTo(ship.length * 0.1, ship.width, ship.length * 0.9, ship.width)
        ctx.quadraticCurveTo(ship.length, ship.width * 0.8, ship.length, ship.width * 0.5)
        ctx.lineTo(ship.length * 0.95, ship.width * 0.25)
        ctx.lineTo(ship.length * 0.05, ship.width * 0.25)
        ctx.closePath()
        ctx.fill()

        // Container stacks
        const containerColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"]
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 8; col++) {
            ctx.fillStyle = containerColors[Math.floor((row + col) % containerColors.length)]
            ctx.fillRect(
              ship.length * (0.1 + col * 0.08),
              ship.width * (0.05 + row * 0.06),
              ship.length * 0.07,
              ship.width * 0.05,
            )
          }
        }

        // Superstructure
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(ship.length * 0.85, ship.width * 0.02, ship.length * 0.12, ship.width * 0.25)
      }

      ctx.restore()

      ship.bowWave.forEach((wave: any, index: number) => {
        if (wave.life > 0) {
          ctx.save()
          ctx.globalAlpha = (wave.life / wave.maxLife) * 0.4
          ctx.strokeStyle = "#93c5fd"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(wave.x, wave.y, wave.life * 0.5, wave.angle, wave.angle + Math.PI * 0.3)
          ctx.stroke()
          ctx.restore()

          wave.life -= 0.8
          wave.angle += 0.1
        } else {
          // Reset wave at ship's bow
          wave.x = ship.x + ship.length
          wave.y = shipY + ship.width / 2
          wave.life = wave.maxLife
          wave.angle = Math.PI + (Math.random() - 0.5) * 0.5
        }
      })

      ship.wakeParticles.forEach((particle: any) => {
        if (particle.life > 0) {
          ctx.save()
          ctx.globalAlpha = (particle.life / particle.maxLife) * 0.5
          ctx.fillStyle = "#bfdbfe"
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()

          particle.x += particle.vx
          particle.y += particle.vy
          particle.vx *= 0.98 // Drag
          particle.vy += 0.02 // Slight downward drift
          particle.life -= 0.6
        } else {
          // Reset particle at ship's stern
          particle.x = ship.x - 10 - Math.random() * 30
          particle.y = shipY + ship.width / 2 + (Math.random() - 0.5) * ship.width
          particle.vx = -ship.speed * 0.5 + (Math.random() - 0.5) * 0.3
          particle.vy = (Math.random() - 0.5) * 0.2
          particle.life = particle.maxLife
          particle.size = 1 + Math.random() * 2
        }
      })
    }

    const drawWaterSurface = (time: number) => {
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1

      for (let i = 0; i < waterWaves.length - 1; i++) {
        const wave1 = waterWaves[i]
        const wave2 = waterWaves[i + 1]

        const y1 = wave1.baseY + Math.sin(time * wave1.speed + wave1.phase) * wave1.amplitude
        const y2 = wave2.baseY + Math.sin(time * wave2.speed + wave2.phase) * wave2.amplitude

        if (i === 0) {
          ctx.beginPath()
          ctx.moveTo(wave1.x, y1)
        }

        const cpx = (wave1.x + wave2.x) / 2
        const cpy = (y1 + y2) / 2
        ctx.quadraticCurveTo(cpx, cpy, wave2.x, y2)
      }

      ctx.stroke()
      ctx.restore()
    }

    let animationTime = 0

    const animate = () => {
      animationTime += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawWaterSurface(animationTime)

      atmosphericParticles.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.opacity * (particle.life / particle.maxLife)
        ctx.fillStyle = "#e0f2fe"
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.5

        if (particle.life <= 0 || particle.y < 0) {
          particle.x = Math.random() * canvas.width
          particle.y = canvas.height * 0.8 + Math.random() * canvas.height * 0.2
          particle.vx = (Math.random() - 0.5) * 0.2
          particle.vy = -Math.random() * 0.1
          particle.life = particle.maxLife
        }
      })

      ships.forEach((ship) => {
        drawRealisticShip(ship, animationTime)

        ship.x += ship.speed
        if (ship.x > canvas.width + 350) {
          ship.x = -350
          ship.type = Math.floor(Math.random() * 3) // Change ship type
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" style={{ pointerEvents: "none" }} />
  )
}
