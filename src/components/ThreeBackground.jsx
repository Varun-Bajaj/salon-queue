import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 24

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Golden Floating Ring (3D Torus)
    const torusGeometry = new THREE.TorusGeometry(8, 0.25, 16, 100)
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0xD4A017,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const torus = new THREE.Mesh(torusGeometry, torusMaterial)
    torus.rotation.x = Math.PI / 3
    scene.add(torus)

    // Golden Particle Field
    const particleCount = 180
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const color1 = new THREE.Color(0xD4A017) // Gold
    const color2 = new THREE.Color(0xF9E9BE) // Champagne
    const color3 = new THREE.Color(0x343D4E) // Subtle Slate

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45
      positions[i + 1] = (Math.random() - 0.5) * 35
      positions[i + 2] = (Math.random() - 0.5) * 20

      const mixed = Math.random() > 0.4 ? (Math.random() > 0.5 ? color1 : color2) : color3
      colors[i] = mixed.r
      colors[i + 1] = mixed.g
      colors[i + 2] = mixed.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const pMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    const particles = new THREE.Points(geometry, pMaterial)
    scene.add(particles)

    // Mouse interactive parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation Loop
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)

      targetX += (mouseX * 2.5 - targetX) * 0.05
      targetY += (mouseY * 2.5 - targetY) * 0.05

      torus.rotation.x += 0.002
      torus.rotation.y += 0.003
      torus.position.x = targetX * 1.5
      torus.position.y = targetY * 1.5

      particles.rotation.y += 0.0008
      particles.rotation.x += 0.0004
      particles.position.x = -targetX * 0.8
      particles.position.y = -targetY * 0.8

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      torusGeometry.dispose()
      pMaterial.dispose()
      torusMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-70"
      aria-hidden="true"
    />
  )
}
