import coverThumb from "./optimized/cover-thumb.webp"
import coverMedium from "./optimized/cover-medium.webp"
import coverLarge from "./optimized/cover-large.webp"
import image1Thumb from "./optimized/image1-thumb.webp"
import image1Medium from "./optimized/image1-medium.webp"
import image1Large from "./optimized/image1-large.webp"
import image2Thumb from "./optimized/image2-thumb.webp"
import image2Medium from "./optimized/image2-medium.webp"
import image2Large from "./optimized/image2-large.webp"
import image3Thumb from "./optimized/image3-thumb.webp"
import image3Medium from "./optimized/image3-medium.webp"
import image3Large from "./optimized/image3-large.webp"
import image4Thumb from "./optimized/image4-thumb.webp"
import image4Medium from "./optimized/image4-medium.webp"
import image4Large from "./optimized/image4-large.webp"
import image5Thumb from "./optimized/image5-thumb.webp"
import image5Medium from "./optimized/image5-medium.webp"
import image5Large from "./optimized/image5-large.webp"
import image6Thumb from "./optimized/image6-thumb.webp"
import image6Medium from "./optimized/image6-medium.webp"
import image6Large from "./optimized/image6-large.webp"
import image7Thumb from "./optimized/image7-thumb.webp"
import image7Medium from "./optimized/image7-medium.webp"
import image7Large from "./optimized/image7-large.webp"
import image8Thumb from "./optimized/image8-thumb.webp"
import image8Medium from "./optimized/image8-medium.webp"
import image8Large from "./optimized/image8-large.webp"
import image9Thumb from "./optimized/image9-thumb.webp"
import image9Medium from "./optimized/image9-medium.webp"
import image9Large from "./optimized/image9-large.webp"
import image10Thumb from "./optimized/image10-thumb.webp"
import image10Medium from "./optimized/image10-medium.webp"
import image10Large from "./optimized/image10-large.webp"
import image11Thumb from "./optimized/image11-thumb.webp"
import image11Medium from "./optimized/image11-medium.webp"
import image11Large from "./optimized/image11-large.webp"
import image12Thumb from "./optimized/image12-thumb.webp"
import image12Medium from "./optimized/image12-medium.webp"
import image12Large from "./optimized/image12-large.webp"
import image13Thumb from "./optimized/image13-thumb.webp"
import image13Medium from "./optimized/image13-medium.webp"
import image13Large from "./optimized/image13-large.webp"
import image14Thumb from "./optimized/image14-thumb.webp"
import image14Medium from "./optimized/image14-medium.webp"
import image14Large from "./optimized/image14-large.webp"
import image15Thumb from "./optimized/image15-thumb.webp"
import image15Medium from "./optimized/image15-medium.webp"
import image15Large from "./optimized/image15-large.webp"
import image16Thumb from "./optimized/image16-thumb.webp"
import image16Medium from "./optimized/image16-medium.webp"
import image16Large from "./optimized/image16-large.webp"

export type ResponsiveImage = {
  thumb: string
  medium: string
  large: string
}

/**
 * 메인 커버 이미지
 */
export const COVER_IMAGE: ResponsiveImage = {
  thumb: coverThumb,
  medium: coverMedium,
  large: coverLarge,
}

/**
 * 갤러리에 표시될 이미지 목록
 */
export const GALLERY_IMAGES: ResponsiveImage[] = [
  { thumb: image1Thumb, medium: image1Medium, large: image1Large },
  { thumb: image2Thumb, medium: image2Medium, large: image2Large },
  { thumb: image3Thumb, medium: image3Medium, large: image3Large },
  { thumb: image4Thumb, medium: image4Medium, large: image4Large },
  { thumb: image5Thumb, medium: image5Medium, large: image5Large },
  { thumb: image6Thumb, medium: image6Medium, large: image6Large },
  { thumb: image7Thumb, medium: image7Medium, large: image7Large },
  { thumb: image8Thumb, medium: image8Medium, large: image8Large },
  { thumb: image9Thumb, medium: image9Medium, large: image9Large },
  { thumb: image10Thumb, medium: image10Medium, large: image10Large },
  { thumb: image11Thumb, medium: image11Medium, large: image11Large },
  { thumb: image12Thumb, medium: image12Medium, large: image12Large },
  { thumb: image13Thumb, medium: image13Medium, large: image13Large },
  { thumb: image14Thumb, medium: image14Medium, large: image14Large },
  { thumb: image15Thumb, medium: image15Medium, large: image15Large },
  { thumb: image16Thumb, medium: image16Medium, large: image16Large },
]
