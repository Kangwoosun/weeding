import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ArrowLeft from "../../icons/angle-left-sm.svg?react"
import { LazyDiv } from "../lazyDiv"
import { Button } from "../button"
import { Modal } from "../modal"
import { GALLERY_IMAGES, type ResponsiveImage } from "../../images"

const GALLERY_IMAGE_SIZES = "(min-width: 981px) 420px, 84vw"
const THUMBNAIL_IMAGE_SIZES = "(min-width: 981px) 200px, 42vw"
const getSrcSet = (image: ResponsiveImage) =>
  `${image.thumb} 600w, ${image.medium} 1200w, ${image.large} 2400w`

/**
 * 캐러셀 이미지 렌더링 및 프리로드 설정
 */
const TOTAL_SLIDES = GALLERY_IMAGES.length
const preloadedImages = new Set<string>()

const normalizeSlide = (slide: number) =>
  (slide + TOTAL_SLIDES) % TOTAL_SLIDES

const getVisibleSlideIndexes = (slide: number) => [
  normalizeSlide(slide - 1),
  normalizeSlide(slide),
  normalizeSlide(slide + 1),
]

const preloadGalleryImage = (image: ResponsiveImage) => {
  if (preloadedImages.has(image.medium)) return
  preloadedImages.add(image.medium)

  const img = new Image()
  img.decoding = "async"
  img.sizes = GALLERY_IMAGE_SIZES
  img.srcset = getSrcSet(image)
  img.src = image.medium
  img.decode?.().catch(() => undefined)
}

const renderCarouselItem = (item: ResponsiveImage, idx: number) => (
  <div className="carousel-item" key={`${idx}-${item.medium}`}>
    <img
      src={item.medium}
      srcSet={getSrcSet(item)}
      sizes={GALLERY_IMAGE_SIZES}
      loading="eager"
      decoding="async"
      draggable={false}
      alt={`${idx}`}
    />
  </div>
)

// 드래그 감도 설정
const DRAG_SENSITIVITY = 15

/**
 * 캐러셀 상태 타입 정의
 */
type Status =
  | "stationary"
  | "clicked"
  | "clickCanceled"
  | "dragging"
  | "dragEnding"

/**
 * 드래그 옵션 타입 정의
 */
type DragOption = {
  startingClientX: number
  startingClientY: number
  currentTranslateX: number
}

type ClickMove = "left" | "right" | null

/**
 * 갤러리 컴포넌트입니다.
 * 사진 캐러셀 기능과 전체 사진 보기 모달 기능을 제공합니다.
 * 터치 및 마우스 드래그를 지원합니다.
 *
 * @returns {JSX.Element} 갤러리 섹션
 */
export const Gallery = () => {
  const modalState = useState(false)
  const carouselRef = useRef<HTMLDivElement>({} as HTMLDivElement)

  // 슬라이드 인덱스 상태
  const [slide, _setSlide] = useState(0)
  const slideRef = useRef(0)
  const setSlide = (slide: number) => {
    _setSlide(slide)
    slideRef.current = slide
  }

  // 캐러셀 동작 상태
  const [status, _setStatus] = useState<Status>("stationary")
  const statusRef = useRef<Status>("stationary")
  const setStatus = (status: Status) => {
    _setStatus(status)
    statusRef.current = status
  }

  // 드래그 정보 상태
  const [dragOption, _setDragOption] = useState<DragOption>({
    startingClientX: 0,
    startingClientY: 0,
    currentTranslateX: 0,
  })
  const dragOptionRef = useRef<DragOption>({
    startingClientX: 0,
    startingClientY: 0,
    currentTranslateX: 0,
  })
  const setDragOption = (dragOption: DragOption) => {
    _setDragOption(dragOption)
    dragOptionRef.current = dragOption
  }

  const clickMoveRef = useRef<ClickMove>(null)
  const setClickMove = (clickMove: ClickMove) => {
    clickMoveRef.current = clickMove
  }

  useEffect(() => {
    ;[-2, -1, 0, 1, 2].forEach((offset) => {
      preloadGalleryImage(GALLERY_IMAGES[normalizeSlide(slide + offset)])
    })
  }, [slide])

  /**
   * 마우스/터치 다운 이벤트 처리
   */
  const click = (
    status: Status,
    clientX: number,
    clientY: number,
    carouselWidth: number,
  ) => {
    if (status !== "stationary") return
    setDragOption({
      startingClientX: clientX,
      startingClientY: clientY,
      currentTranslateX: -carouselWidth,
    })
    setStatus("clicked")
  }

  /**
   * 드래그 중 처리
   */
  const dragging = useCallback(
    (dragOption: DragOption, clientX: number, carouselWidth: number) => {
      let moveTranslateX = clientX - dragOption.startingClientX

      // 드래그 범위 제한
      if (moveTranslateX > carouselWidth) {
        moveTranslateX = carouselWidth
      } else if (moveTranslateX < -carouselWidth) {
        moveTranslateX = -carouselWidth
      }

      setDragOption({
        ...dragOption,
        currentTranslateX: moveTranslateX - carouselWidth,
      })
    },
    [],
  )

  /**
   * 드래그 종료 시 슬라이드 이동 결정 및 애니메이션 처리
   */
  const dragEnd = useCallback(
    (slide: number, dragOption: DragOption, carouselWidth: number) => {
      let move = 0
      // 10% 이상 드래그했을 때 다음/이전 슬라이드로 이동
      if (dragOption.currentTranslateX < -carouselWidth * 1.1) {
        move = 1
      } else if (dragOption.currentTranslateX > -carouselWidth * 0.9) {
        move = -1
      }

      setDragOption({
        ...dragOption,
        currentTranslateX: -carouselWidth * (move + 1),
      })

      setStatus("dragEnding")

      setTimeout(() => {
        setDragOption({
          ...dragOption,
          currentTranslateX: -carouselWidth,
        })
        setStatus("stationary")
        setSlide(normalizeSlide(slide + move))
      }, 300)
    },
    [],
  )

  /**
   * 버튼 클릭 등에 의한 슬라이드 이동 처리
   */
  const move = useCallback((srcIdx: number, dstIdx: number) => {
    const carouselWidth = carouselRef.current.clientWidth
    const forwardDistance = normalizeSlide(dstIdx - srcIdx)
    const backwardDistance = normalizeSlide(srcIdx - dstIdx)
    const direction =
      forwardDistance === 1 || forwardDistance <= backwardDistance ? 1 : -1

    setDragOption({
      startingClientX: 0,
      startingClientY: 0,
      currentTranslateX: -carouselWidth * (direction + 1),
    })
    setStatus("dragEnding")

    setTimeout(() => {
      setClickMove(null)
      setDragOption({
        startingClientX: 0,
        startingClientY: 0,
        currentTranslateX: -carouselWidth,
      })
      setSlide(normalizeSlide(dstIdx))
      setStatus("stationary")
    }, 300)
  }, [])

  /* 이벤트 핸들러 */
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const status = statusRef.current

      if (status === "clicked") {
        setStatus("dragging")
      } else if (status === "dragging") {
        e.preventDefault()
        dragging(
          dragOptionRef.current,
          e.clientX,
          carouselRef.current.clientWidth,
        )
      }
    },
    [dragging],
  )

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const status = statusRef.current

      if (status === "clicked") {
        e.preventDefault()
        const xMove =
          e.targetTouches[0].clientX - dragOptionRef.current.startingClientX
        const yMove =
          e.targetTouches[0].clientY - dragOptionRef.current.startingClientY
        // 일정 거리 이상 움직였을 때만 드래그로 간주
        if (Math.abs(xMove) > DRAG_SENSITIVITY) {
          setStatus("dragging")
        } else if (Math.abs(yMove) > DRAG_SENSITIVITY) {
          setStatus("clickCanceled")
        }
      } else if (status === "dragging") {
        e.preventDefault()
        dragging(
          dragOptionRef.current,
          e.targetTouches[0].clientX,
          carouselRef.current.clientWidth,
        )
      }
    },
    [dragging],
  )

  const onMouseTouchUp = useCallback(() => {
    const status = statusRef.current
    const clickMove = clickMoveRef.current
    const slide = slideRef.current

    if (status === "clicked") {
      if (clickMove === "left") {
        move(slide, normalizeSlide(slide - 1))
      } else if (clickMove === "right") {
        move(slide, normalizeSlide(slide + 1))
      } else {
        setStatus("stationary")
      }
    } else if (status === "dragging") {
      dragEnd(slide, dragOptionRef.current, carouselRef.current.clientWidth)
    } else if (status === "clickCanceled") {
      setStatus("stationary")
    }
  }, [dragEnd, move])

  useEffect(() => {
    const carouselElement = carouselRef.current

    window.addEventListener("mousemove", onMouseMove)
    carouselElement.addEventListener("touchmove", onTouchMove)
    window.addEventListener("mouseup", onMouseTouchUp)
    window.addEventListener("touchend", onMouseTouchUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      carouselElement.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("mouseup", onMouseTouchUp)
      window.removeEventListener("touchend", onMouseTouchUp)
    }
  }, [onMouseMove, onTouchMove, onMouseTouchUp])

  /**
   * 인디케이터 클릭 시 해당 슬라이드로 이동
   */
  const onIndicatorClick = useCallback(
    (status: Status, srcIdx: number, dstIdx: number) => {
      if (status !== "stationary" || srcIdx === dstIdx) return
      move(srcIdx, dstIdx)
    },
    [move],
  )

  const transformStyle = useMemo(() => {
    switch (status) {
      case "dragging":
      case "dragEnding":
        return { transform: `translateX(${dragOption.currentTranslateX}px)` }
      default:
        return {}
    }
  }, [status, dragOption])

  const transformClass = useMemo(() => {
    const className = "carousel-list windowed"
    switch (status) {
      case "dragEnding":
        return className + " transitioning"
      default:
        return className
    }
  }, [status])

  const visibleSlideIndexes = useMemo(
    () => getVisibleSlideIndexes(slide),
    [slide],
  )

  return (
    <>
      <LazyDiv className="card gallery">
        <h2 className="english">GALLERY</h2>
        <div className="carousel-wrapper">
          <div
            className="carousel"
            ref={carouselRef}
            onMouseDown={(e) =>
              click(
                statusRef.current,
                e.clientX,
                e.clientY,
                e.currentTarget.clientWidth,
              )
            }
            onTouchStart={(e) =>
              click(
                statusRef.current,
                e.targetTouches[0].clientX,
                e.targetTouches[0].clientY,
                e.currentTarget.clientWidth,
              )
            }
          >
            <div className={transformClass} style={transformStyle}>
              {visibleSlideIndexes.map((idx) =>
                renderCarouselItem(GALLERY_IMAGES[idx], idx),
              )}
            </div>

            {/* 좌우 화살표 컨트롤 */}
            <div className="carousel-control">
              <div
                className="control left"
                onMouseDown={() => {
                  if (statusRef.current === "stationary") setClickMove("left")
                }}
                onTouchStart={() => {
                  if (statusRef.current === "stationary") setClickMove("left")
                }}
              >
                <ArrowLeft className="arrow" />
              </div>
              <div
                className="control right"
                onMouseDown={() => {
                  if (statusRef.current === "stationary") setClickMove("right")
                }}
                onTouchStart={() => {
                  if (statusRef.current === "stationary") setClickMove("right")
                }}
              >
                <ArrowLeft className="arrow right" />
              </div>
            </div>
          </div>

          {/* 하단 인디케이터 (점) */}
          <div className="carousel-indicator">
            {GALLERY_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`indicator${idx === slide ? " active" : ""}`}
                onClick={() =>
                  onIndicatorClick(statusRef.current, slideRef.current, idx)
                }
              />
            ))}
          </div>
        </div>

        <div className="break" />

        <Button onClick={() => modalState[1](true)}>사진 전체보기</Button>
      </LazyDiv>

      {/* 사진 전체보기 모달 */}
      <Modal
        modalState={modalState}
        className="all-photo-modal"
        closeOnClickBackground={true}
      >
        <div className="header">
          <div className="title">사진 전체보기</div>
        </div>

        <div className="content">
          <div className="photo-list">
            {GALLERY_IMAGES.map((image, idx) => (
              <img
                key={idx}
                src={image.thumb}
                srcSet={`${image.thumb} 600w, ${image.medium} 1200w`}
                sizes={THUMBNAIL_IMAGE_SIZES}
                loading="lazy"
                decoding="async"
                alt={`${idx}`}
                draggable={false}
                onClick={() => {
                  if (statusRef.current === "stationary") {
                    if (idx !== slideRef.current) {
                      move(slideRef.current, idx)
                    }
                    modalState[1](false)
                  }
                }}
              />
            ))}
          </div>
          <div className="break" />
        </div>
        <div className="footer">
          <Button
            type="button"
            buttonStyle="style2"
            className="bg-light-grey-color text-dark-color"
            onClick={() => modalState[1](false)}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </>
  )
}
