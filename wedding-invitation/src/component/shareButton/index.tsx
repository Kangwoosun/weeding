import {
  BRIDE_FULLNAME,
  GROOM_FULLNAME,
  LOCATION,
  WEDDING_DATE,
  WEDDING_DATE_FORMAT,
} from "../../const"
import ktalkIcon from "../../icons/ktalk-icon.png"
import { LazyDiv } from "../lazyDiv"
import { useKakao } from "../store"
import { absolutePublicUrlWithBasePath } from "../../url"

/**
 * 카카오톡으로 초대장을 공유할 수 있는 버튼 컴포넌트입니다.
 *
 * @returns {JSX.Element} 공유 버튼 섹션
 */
export const ShareButton = () => {
  const kakao = useKakao()

  return (
    <LazyDiv className="footer share-button">
      <button
        className="ktalk-share"
        onClick={() => {
          if (!kakao) {
            alert("카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.")
            return
          }

          const invitationUrl = absolutePublicUrlWithBasePath("")
          const title = `${GROOM_FULLNAME} ❤️ ${BRIDE_FULLNAME}의 결혼식에 초대합니다.`
          const description =
            WEDDING_DATE.format(WEDDING_DATE_FORMAT) +
            "\n" +
            LOCATION +
            "\n" +
            invitationUrl

          kakao.Share.sendDefault({
            objectType: "feed",
            content: {
              title,
              description,
              imageUrl: absolutePublicUrlWithBasePath("preview_image.webp"),
              imageWidth: 2400,
              imageHeight: 3599,
              link: {
                mobileWebUrl: invitationUrl,
                webUrl: invitationUrl,
              },
            },
            buttonTitle: "초대장 보기",
            buttons: [
              {
                title: "초대장 보기",
                link: {
                  mobileWebUrl: invitationUrl,
                  webUrl: invitationUrl,
                },
              },
            ],
          })
        }}
      >
        <img src={ktalkIcon} alt="ktalk-icon" /> 카카오톡으로 공유하기
      </button>
    </LazyDiv>
  )
}
