// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
import { shallow } from "enzyme"
import { LinkText } from "lib/Components/Text/LinkText"
import { LegacyNativeModules } from "lib/NativeModules/LegacyNativeModules"
import { navigate } from "lib/navigation/navigate"
import { Button } from "palette"
import React from "react"
import { PrivacyRequest } from "../PrivacyRequest"

describe(PrivacyRequest, () => {
  it("handles privacy policy link taps", () => {
    const tree = shallow(<PrivacyRequest />)

    tree.find(LinkText).at(0).simulate("press")

    expect(navigate).toHaveBeenCalledWith("/privacy", { modal: true })
  })

  it("handles email link taps", () => {
    const tree = shallow(<PrivacyRequest />)

    tree.find(LinkText).at(1).simulate("press")

    expect(LegacyNativeModules.ARScreenPresenterModule.presentEmailComposerWithSubject).toHaveBeenCalledWith(
      "Personal Data Request",
      "privacy@artsy.net"
    )
  })

  it("handles CCPA button presses", () => {
    const tree = shallow(<PrivacyRequest />)

    tree.find(Button).simulate("press")

    expect(LegacyNativeModules.ARScreenPresenterModule.presentEmailComposerWithBody).toHaveBeenCalledWith(
      "Hello, I'm contacting you to ask that...",
      "Personal Data Request",
      "privacy@artsy.net"
    )
  })
})
