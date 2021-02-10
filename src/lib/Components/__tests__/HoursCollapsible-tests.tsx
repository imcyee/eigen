import { fireEvent } from "@testing-library/react-native"
import { Markdown } from "lib/Components/Markdown"
import { renderWithWrappersTL } from "lib/tests/renderWithWrappers"
import { Collapse } from "palette"
import React from "react"
import { Text, TouchableWithoutFeedback } from "react-native"
import { act } from "react-test-renderer"
import { HoursCollapsible } from "../HoursCollapsible"

describe("HoursCollapsible", () => {
  const hours = {
    text: "Monday: Foo - Bar\nTuesday: Bar - Baz\nWednesday - Friday: Closed",
  }

  it("renders properly", () => {
    const tree = renderWithWrappersTL(<HoursCollapsible openingHours={hours} />)

    expect(tree.getByText("Opening hours")).toBeTruthy()
    expect(tree.UNSAFE_getByType(Collapse).props.open).toBe(false)
  })

  it("expands when pressed", () => {
    const tree = renderWithWrappersTL(<HoursCollapsible openingHours={hours} />)

    fireEvent.press(tree.UNSAFE_getByType(TouchableWithoutFeedback))

    expect(tree.UNSAFE_getByType(Collapse).props.open).toBe(true)
  })

  it("renders markdown", () => {
    const markdownHours = {
      text: "**Collectors Preview**\r\nNovember 8 Thursday 14:00 to 20:00\r\n [November 9th](http://foo.bar)",
    }

    const tree = renderWithWrappersTL(<HoursCollapsible openingHours={markdownHours} />)

    fireEvent.press(tree.UNSAFE_getByType(TouchableWithoutFeedback))

    expect(tree.UNSAFE_getAllByType(Markdown)).toHaveLength(1)
  })
})
