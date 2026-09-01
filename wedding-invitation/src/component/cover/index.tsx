import {
  BRIDE_FULLNAME,
  GROOM_FULLNAME,
  LOCATION,
  WEDDING_DATE,
  WEDDING_DATE_FORMAT,
} from "../../const"
import { COVER_IMAGE } from "../../images"
import { LazyDiv } from "../lazyDiv"

const COVER_IMAGE_SIZES = "(min-width: 981px) 450px, calc(100vw - 4rem)"
const COVER_IMAGE_SRCSET = `${COVER_IMAGE.thumb} 600w, ${COVER_IMAGE.medium} 1200w, ${COVER_IMAGE.large} 2400w`

/**
 * 초대장의 메인 커버 섹션입니다.
 * 예식 일시, 신랑/신부 이름, 장소를 표시합니다.
 *
 * @returns {JSX.Element} 커버 섹션
 */
export const Cover = () => {
  return (
    <LazyDiv className="card cover">
      {/* 커버 이미지 */}
      <div className="image-wrapper">
        <img
          src={COVER_IMAGE.medium}
          srcSet={COVER_IMAGE_SRCSET}
          sizes={COVER_IMAGE_SIZES}
          alt="sample"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="subtitle">We're getting married</div>
      {/* 이름 표시 */}
      <div className="names">
        {GROOM_FULLNAME}
        <div className="divider" />
        {BRIDE_FULLNAME}
      </div>
      {/* 예식 정보 (포맷팅된 날짜 및 장소) */}
      <div className="info">{WEDDING_DATE.format(WEDDING_DATE_FORMAT)}</div>
      <div className="info">{LOCATION}</div>
    </LazyDiv>
  )
}
