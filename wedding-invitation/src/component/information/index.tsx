import { useEffect, useState } from "react"
import { BRIDE_INFO, BUS_APPLICATION_FORM_URL, GROOM_INFO } from "../../const"
import { Button } from "../button"
import { LazyDiv } from "../lazyDiv"
import { Modal } from "../modal"

const BUS_APPLICATION_MODAL_DISMISS_KEY =
  "wedding.busApplicationModalDismissedUntil"
const BUS_APPLICATION_MODAL_DISMISS_DURATION_MS = 24 * 60 * 60 * 1000

const shouldOpenInitialBusApplicationModal = () => {
  try {
    const dismissedUntil = Number(
      window.localStorage.getItem(BUS_APPLICATION_MODAL_DISMISS_KEY) ?? 0,
    )

    if (!dismissedUntil) return true

    if (Date.now() > dismissedUntil) {
      window.localStorage.removeItem(BUS_APPLICATION_MODAL_DISMISS_KEY)
      return true
    }

    return false
  } catch {
    return true
  }
}

const saveBusApplicationModalDismissal = () => {
  try {
    window.localStorage.setItem(
      BUS_APPLICATION_MODAL_DISMISS_KEY,
      String(Date.now() + BUS_APPLICATION_MODAL_DISMISS_DURATION_MS),
    )
  } catch {
    // localStorage를 사용할 수 없는 환경에서는 현재 닫기 동작만 유지합니다.
  }
}

/**
 * 식사 정보 안내 컴포넌트입니다.
 */
export const Information1 = () => {
  return (
    <>
      <h2 className="english">INFORMATION</h2>
      <div className="info-card">
        <div className="label">🍽️ 식사 안내</div>
        <div className="content">
          식사시간: 14시 30분 ~ 17시 30분
          <br />
          장소: 지상 2층 연회장
        </div>
      </div>
    </>
  )
}

/**
 * 서울 ↔ 대전 전세버스 탑승 신청 안내 컴포넌트입니다.
 */
export const BusApplicationInfo = () => {
  const [isBusApplicationModalOpen, setBusApplicationModalOpen] =
    useState(false)
  const [
    shouldDismissInitialBusApplicationModal,
    setShouldDismissInitialBusApplicationModal,
  ] = useState(false)

  useEffect(() => {
    if (shouldOpenInitialBusApplicationModal()) {
      setBusApplicationModalOpen(true)
    }
  }, [])

  const openBusApplicationModal = () => {
    setShouldDismissInitialBusApplicationModal(false)
    setBusApplicationModalOpen(true)
  }

  const persistBusApplicationModalDismissal = () => {
    if (shouldDismissInitialBusApplicationModal) {
      saveBusApplicationModalDismissal()
    }
    setShouldDismissInitialBusApplicationModal(false)
  }

  const closeBusApplicationModal = () => {
    persistBusApplicationModalDismissal()
    setBusApplicationModalOpen(false)
  }

  const openApplicationForm = () => {
    window.open(BUS_APPLICATION_FORM_URL, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <div className="info-card bus-application-card">
        <div className="label">🚌 전세버스 신청</div>
        <div className="content">
          결혼식 당일 서울에서 대전 예식장까지,
          <br />
          예식 후 대전에서 서울까지
          <br />
          전세버스를 운행할 예정입니다.
          <div className="break" />
          탑승을 원하시는 하객분들은
          <br />
          정확한 인원 확인을 위해
          <br />
          신청서를 작성해주세요.
          <div className="break" />
          출발 시간과 탑승 위치는
          <br />
          신청 마감 후 개별 안내드리겠습니다.
        </div>

        <div className="break" />

        <Button style={{ width: "100%" }} onClick={openBusApplicationModal}>
          전세버스 탑승 신청하기
        </Button>
      </div>

      <Modal
        modalState={[isBusApplicationModalOpen, setBusApplicationModalOpen]}
        className="bus-application-modal"
        closeOnClickBackground={true}
        onClose={persistBusApplicationModalDismissal}
      >
        <div className="header">
          <div className="title">전세버스 신청</div>
        </div>
        <div className="content">
          <div className="info-message">
            결혼식 당일 서울 ↔ 대전 전세버스를
            <br />
            운행할 예정입니다.
            <div className="break" />
            탑승을 원하시는 분들은
            <br />
            정확한 인원 확인을 위해
            <br />
            신청서를 작성해주세요.
            <div className="break" />
            출발 시간과 탑승 위치는
            <br />
            신청 마감 후 개별 안내드리겠습니다.
          </div>
          <label className="dismiss-option">
            <input
              type="checkbox"
              checked={shouldDismissInitialBusApplicationModal}
              onChange={(e) =>
                setShouldDismissInitialBusApplicationModal(e.target.checked)
              }
            />
            <span>하루 동안 보지 않기</span>
          </label>
        </div>
        <div className="footer">
          <Button buttonStyle="style2" onClick={openApplicationForm}>
            신청하기
          </Button>
          <Button
            buttonStyle="style2"
            className="bg-light-grey-color text-dark-color"
            onClick={closeBusApplicationModal}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </>
  )
}

/**
 * 축의금 계좌번호 안내 컴포넌트입니다.
 * 신랑측, 신부측 계좌번호를 모달로 보여줍니다.
 */
export const Information2 = () => {
  const donationModalState = useState(false)
  const [isGroom, setIsGroom] = useState(true)

  return (
    <>
      <div className="info-card">
        <div className="label">💝 마음 전하기</div>
        <div className="content">
          참석이 어려워 직접 축하해주지 못하는
          <br />
          분들을 위해 계좌번호를 기재하였습니다.
          <br />
          넓은 마음으로 양해 부탁드립니다.
        </div>

        <div className="break" />

        <Button
          style={{ width: "100%" }}
          onClick={() => {
            donationModalState[1](true)
            setIsGroom(true)
          }}
        >
          신랑측 계좌번호 보기
        </Button>
        <div className="break" />
        <Button
          style={{ width: "100%" }}
          onClick={() => {
            donationModalState[1](true)
            setIsGroom(false)
          }}
        >
          신부측 계좌번호 보기
        </Button>
      </div>

      {/* 계좌 정보 모달 */}
      <Modal
        modalState={donationModalState}
        className="donation-modal"
        closeOnClickBackground={true}
      >
        <div className="header">
          <div className="title">
            {isGroom ? "신랑측 계좌번호" : "신부측 계좌번호"}
          </div>
        </div>
        <div className="content">
          {(isGroom ? GROOM_INFO : BRIDE_INFO)
            .filter(({ account }) => !!account)
            .map(({ relation, name, account }) => (
              <div className="account-info" key={relation}>
                <div>
                  <div className="name">
                    <span className="relation">{relation}</span> {name}
                  </div>
                  <div>{account}</div>
                </div>
                <Button
                  className="copy-button"
                  onClick={async () => {
                    if (account) {
                      try {
                        // 계좌번호 복사 기능
                        await navigator.clipboard.writeText(account)
                        alert(account + "\n복사되었습니다.")
                      } catch {
                        alert("복사에 실패했습니다.")
                      }
                    }
                  }}
                >
                  복사하기
                </Button>
              </div>
            ))}
        </div>
        <div className="footer">
          <Button
            buttonStyle="style2"
            className="bg-light-grey-color text-dark-color"
            onClick={() => donationModalState[1](false)}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </>
  )
}

/**
 * 정보 안내(식사, 축의금, 참석의사)를 통합하여 표시하는 컴포넌트입니다.
 *
 * @returns {JSX.Element} 정보 안내 섹션
 */
export const Information = () => {
  return (
    <LazyDiv className="card information">
      <Information1 />
      <BusApplicationInfo />
      <Information2 />
    </LazyDiv>
  )
}
