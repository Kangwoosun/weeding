import { Map } from "./map"
import CarIcon from "../../icons/car-icon.svg?react"
import BusIcon from "../../icons/bus-icon.svg?react"
import { LazyDiv } from "../lazyDiv"
import { LOCATION, LOCATION_ADDRESS } from "../../const"

const ROAD_ADDRESS = "대전 유성구 동서대로 639"
const LOT_ADDRESS = "원신흥동 578-6"
const WEDDING_HALL_TEL = "042-823-5220"

const copyTextWithFallback = (text: string) => {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.top = "-9999px"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  const copied = document.execCommand("copy")
  document.body.removeChild(textarea)

  return copied
}

const copyTextToClipboard = async (text: string) => {
  let copied = false

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      copied = true
    } catch {
      copied = false
    }
  }

  if (!copied) {
    copied = copyTextWithFallback(text)
  }

  if (copied) {
    alert(`${text}\n복사되었습니다.`)
    return
  }

  alert("복사에 실패했습니다.")
}

/**
 * 오시는 길 정보를 표시하는 컴포넌트입니다.
 * 지도와 대중교통, 자가용 이용 방법을 안내합니다.
 *
 * @returns {JSX.Element} 오시는 길 섹션
 */
export const Location = () => {
  return (
    <>
      {/* 지도 및 주소 섹션 */}
      <LazyDiv className="card location">
        <h2 className="english">LOCATION</h2>
        <div className="addr">
          {LOCATION}
          <div className="detail">{LOCATION_ADDRESS}</div>
        </div>
        <Map />
      </LazyDiv>

      {/* 대중교통 및 자가용 안내 섹션 */}
      <LazyDiv className="card location">
        {/* 대중교통 안내 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <BusIcon className="transportation-icon" />
          </div>
          <div className="heading">대중교통</div>
          <div />
          <div className="content">
            유성온천역 6번 출구
            <br />
            → 106번, 706번 중 승차
            <br />
            → 106번 흥도초 하차,
            <br />
            706번 등기소/아이파크시티 하차
            <br />
            → 목원대사거리 우측방향
            <br />
            500M 도보
          </div>
        </div>

        {/* 자가용 안내 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <CarIcon className="transportation-icon" />
          </div>
          <div className="heading">자가용</div>
          <div />
          <div className="content">
            유성IC삼거리에서
            <br />
            ‘공주, 계룡산’ 방면 좌회전 후 직진
            <br />
            → ‘서대전,유성’ 방면 좌회전 후 직진
            <br />
            → 구암역삼거리 좌회전
            <br />
            → 유성온천역사거리 우회전
            <br />
            → 도안고등학교
            <br />
            → 목원대사거리 우회전 500M
          </div>
        </div>

        <div className="location-address-info">
          <div className="address-row">
            <span className="address-label">도로명주소:</span>
            <span className="address-value">{ROAD_ADDRESS}</span>
            <button
              type="button"
              className="copy-address-button"
              onClick={() => copyTextToClipboard(ROAD_ADDRESS)}
            >
              복사하기
            </button>
          </div>
          <div className="address-row">
            <span className="address-label">지번주소:</span>
            <span className="address-value">{LOT_ADDRESS}</span>
            <button
              type="button"
              className="copy-address-button"
              onClick={() => copyTextToClipboard(LOT_ADDRESS)}
            >
              복사하기
            </button>
          </div>
          <div className="address-row">
            <span className="address-label">TEL :</span>
            <a className="address-value tel-link" href="tel:0428235220">
              {WEDDING_HALL_TEL}
            </a>
          </div>
        </div>
      </LazyDiv>
    </>
  )
}
