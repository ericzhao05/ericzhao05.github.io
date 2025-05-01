document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".project-cards li")
    const nextBtn = document.querySelector(".next-btn")
    const prevBtn = document.querySelector(".prev-btn")
  
    let current = 0
    const cardWidth = 500
    const gap = 80
    const total = cards.length
  
    function mod(n, m) {
      return ((n % m) + m) % m // circular index  
    }
  
    function animate() {
      cards.forEach((card, i) => {
        const offset = mod(i - current, total)
        
        let centerOffset
        if (offset > total / 2) {
          centerOffset = offset - total
        } else {
          centerOffset = offset
        }

        let scale
        if (centerOffset === 0) {
          scale = 1
        } else {
          scale = 0.7
        }

        const zIndex = -Math.abs(centerOffset)

        gsap.to(card, {
          x: centerOffset * (cardWidth + gap),
          scale: scale,
          zIndex: zIndex,
          duration: 0.5,
          ease: "power2.out"
        })
      })
    }
  
    nextBtn.addEventListener("click", () => {
      current = mod(current + 1, total)
      animate()
    })
  
    prevBtn.addEventListener("click", () => {
      current = mod(current - 1, total)
      animate()
    })
  
    animate()
})