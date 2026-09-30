import { useState, useEffect } from 'react'
import { testimonialService } from '../services/testimonialService'
import { Testimonial } from '../types'
import { TESTIMONIALS } from '../data/testimonials'

interface UseTestimonialsReturn {
  testimonials: Testimonial[]
  loading: boolean
}

export function useTestimonials(): UseTestimonialsReturn {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    testimonialService.getAll()
      .then((data) => {
        if (!cancelled) {
          setTestimonials(data.results.length > 0 ? data.results : TESTIMONIALS)
        }
      })
      .catch(() => {
        if (!cancelled) {
          console.warn('[VoyageAI] Backend unavailable — using local testimonial data.')
          setTestimonials(TESTIMONIALS)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { testimonials, loading }
}
