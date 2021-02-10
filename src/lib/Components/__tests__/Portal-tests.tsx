import { renderWithWrappersTL } from "lib/tests/renderWithWrappers"
import React from "react"
import { Text, View } from "react-native"

import { Portal, PortalProvider } from "../Portal"

describe("Portal", () => {
  it("Renders children as children of PortalProvider", () => {
    const tree = renderWithWrappersTL(
      <PortalProvider>
        <View>
          <Text>Foo Bar</Text>
          <Portal>
            <Text>Bar Baz</Text>
          </Portal>
        </View>
      </PortalProvider>
    )

    expect(tree.getByText("Bar Baz")).toBeTruthy()
  })
})
