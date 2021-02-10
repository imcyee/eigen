import OpaqueImageView from "lib/Components/OpaqueImageView/OpaqueImageView"
import { renderWithWrappers } from "lib/tests/renderWithWrappers"
import React from "react"
import { ImageWithLoadingState } from "../ImageWithLoadingState"

const imageURL = "https://image.com/image.jpg"
const style = { width: 100, height: 300 }

describe("ImageWithLoadingState", () => {
  it("renders the image", () => {
    const tree = renderWithWrappers(<ImageWithLoadingState imageURL={imageURL} {...style} />).root
    expect(tree.findAllByType(OpaqueImageView)).toHaveLength(1)
    expect(tree.findAllByType(OpaqueImageView)[0].props.imageURL).toBe(imageURL)
  })
})
