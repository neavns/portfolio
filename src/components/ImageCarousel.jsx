import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

export default function ImageCarousel({ images }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, suppressClick: false })
  const [viewerIndex, setViewerIndex] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canPrevious, setCanPrevious] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateControls = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    setCanPrevious(viewport.scrollLeft > 1)
    setCanNext(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    const observer = new ResizeObserver(updateControls)
    observer.observe(viewport)
    viewport.addEventListener('scroll', updateControls, { passive: true })
    updateControls()

    return () => {
      observer.disconnect()
      viewport.removeEventListener('scroll', updateControls)
    }
  }, [updateControls])

  const closeViewer = useCallback(() => setViewerIndex(null), [])

  const changeZoom = useCallback((amount) => {
    setZoomLevel((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + amount)))
  }, [])

  const showRelativeImage = useCallback(
    (direction) => {
      setViewerIndex((current) => {
        if (current === null) return current
        return (current + direction + images.length) % images.length
      })
    },
    [images.length]
  )

  useEffect(() => {
    if (viewerIndex === null) {
      document.body.classList.remove('viewer-open')
      return undefined
    }

    setZoomLevel(1)
    document.body.classList.add('viewer-open')
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeViewer()
      if (event.key === 'ArrowLeft') showRelativeImage(-1)
      if (event.key === 'ArrowRight') showRelativeImage(1)
      if (event.key === '+' || event.key === '=') changeZoom(ZOOM_STEP)
      if (event.key === '-') changeZoom(-ZOOM_STEP)
      if (event.key === '0') setZoomLevel(1)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('viewer-open')
    }
  }, [changeZoom, closeViewer, showRelativeImage, viewerIndex])

  const handleViewerWheel = (event) => {
    // event.preventDefault();
    changeZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
  }

  const cardStep = () => {
    const firstCard = trackRef.current?.firstElementChild
    const gap = Number.parseFloat(getComputedStyle(trackRef.current).columnGap) || 0
    return (firstCard?.getBoundingClientRect().width ?? 0) + gap
  }

  const scrollByCard = (direction) => {
    viewportRef.current?.scrollBy({ left: direction * cardStep(), behavior: 'smooth' })
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.pointerType === 'touch') return
    const viewport = viewportRef.current
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      suppressClick: false,
    }
    viewport.classList.add('is-dragging')
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    const viewport = viewportRef.current
    if (!drag.active) return

    const distance = event.clientX - drag.startX
    if (Math.abs(distance) > 4) {
      drag.suppressClick = true
      if (!viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId)
    }
    viewport.scrollLeft = drag.startScrollLeft - distance
  }

  const finishDrag = (event) => {
    const drag = dragRef.current
    const viewport = viewportRef.current
    if (!drag.active) return
    drag.active = false
    viewport.classList.remove('is-dragging')
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
    if (drag.suppressClick)
      window.setTimeout(() => {
        drag.suppressClick = false
      }, 0)
  }

  const openImage = (index, event) => {
    if (dragRef.current.suppressClick) {
      event.preventDefault()
      dragRef.current.suppressClick = false
      return
    }
    setViewerIndex(index)
  }

  const handleCarouselKeyDown = (event) => {
    if (event.key === 'ArrowLeft') scrollByCard(-1)
    if (event.key === 'ArrowRight') scrollByCard(1)
  }

  const activeImage = viewerIndex === null ? null : images[viewerIndex]

  return (
    <>
      <section className="media-carousel" aria-label="Project screenshots">
        <button
          className="carousel-control carousel-previous"
          type="button"
          aria-label="Previous screenshots"
          title="Previous screenshots"
          disabled={!canPrevious}
          onClick={() => scrollByCard(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>

        <div
          ref={viewportRef}
          className="carousel"
          tabIndex="0"
          onKeyDown={handleCarouselKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div ref={trackRef} className="carousel-track">
            {images.map((image, index) => (
              <button
                className="screenshot-card"
                type="button"
                aria-label={`Open ${image.caption}`}
                key={image.src}
                onClick={(event) => openImage(index, event)}
                style={{ '--slide-delay': `${index * 70}ms` }}
              >
                <img src={image.src} alt={image.alt} draggable="false" />
                <strong>{image.caption}</strong>
                <span>{image.detail}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="carousel-control carousel-next"
          type="button"
          aria-label="Next screenshots"
          title="Next screenshots"
          disabled={!canNext}
          onClick={() => scrollByCard(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </section>

      {activeImage && (
        <div
          className="media-viewer-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeViewer()
          }}
        >
          <section
            className="media-viewer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-caption"
          >
            <div className="viewer-toolbar">
              <span className="viewer-caption" id="viewer-caption">
                {activeImage.caption}
              </span>
              <div className="viewer-tools">
                <button
                  className="viewer-button"
                  type="button"
                  disabled={zoomLevel <= MIN_ZOOM}
                  onClick={() => changeZoom(-ZOOM_STEP)}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <Minus aria-hidden="true" />
                </button>
                <button
                  className="viewer-button"
                  type="button"
                  disabled={zoomLevel === 1}
                  onClick={() => setZoomLevel(1)}
                  aria-label="Reset zoom"
                  title="Reset zoom"
                >
                  <RotateCcw aria-hidden="true" />
                </button>
                <button
                  className="viewer-button"
                  type="button"
                  disabled={zoomLevel >= MAX_ZOOM}
                  onClick={() => changeZoom(ZOOM_STEP)}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <Plus aria-hidden="true" />
                </button>
                <button
                  className="viewer-button viewer-close"
                  type="button"
                  onClick={closeViewer}
                  aria-label="Close image viewer"
                  title="Close"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="viewer-stage" onWheel={handleViewerWheel}>
              <button
                className="viewer-step viewer-previous"
                type="button"
                onClick={() => showRelativeImage(-1)}
                aria-label="Previous image"
                title="Previous image"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <img
                className="viewer-image"
                key={activeImage.src}
                src={activeImage.src}
                alt={activeImage.caption}
                style={{ '--viewer-zoom': zoomLevel }}
                draggable="false"
              />
              <button
                className="viewer-step viewer-next"
                type="button"
                onClick={() => showRelativeImage(1)}
                aria-label="Next image"
                title="Next image"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
