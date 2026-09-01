import { INVITATION_URL } from "./env"

const baseUrl = import.meta.env.BASE_URL
const defaultPublicInvitationUrl = "http://woosuneunhye.c0w5un.xyz:65500/"
const publicInvitationBaseUrl = (
  INVITATION_URL || defaultPublicInvitationUrl
).replace(/\/?$/, "/")

export const withBasePath = (path: string) => {
  const normalizedBaseUrl = baseUrl === "/" ? "" : baseUrl.replace(/\/$/, "")
  return `${normalizedBaseUrl}/${path.replace(/^\//, "")}`
}

export const absoluteUrlWithBasePath = (path: string) => {
  return new URL(withBasePath(path), window.location.origin).toString()
}

export const absolutePublicUrlWithBasePath = (path: string) => {
  return new URL(path.replace(/^\//, ""), publicInvitationBaseUrl).toString()
}
