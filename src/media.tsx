import { createMedia } from "@artsy/fresnel"

const podcastrMedia = createMedia({
  breakpoints: {
    xs: 0,
    sm: 768,
    md: 1024,
    lg: 1366,
  },
})

// Make styles for injection into the header of the page
export const mediaStyles = podcastrMedia.createMediaStyle()

export const { Media, MediaContextProvider } = podcastrMedia