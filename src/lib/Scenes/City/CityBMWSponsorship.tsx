import { navigate } from "lib/navigation/navigate"
import { Schema } from "lib/utils/track"
import { Flex, Sans } from "palette"
import React from "react"
import { TouchableOpacity } from "react-native"
import { useTracking } from "react-tracking"
import styled from "styled-components/native"

interface BMWSponsorshipProps {
  url?: string
  logoText: string
  pressable?: boolean
}
export const BMWSponsorship: React.FC<BMWSponsorshipProps> = (props) => {
  const { logoText, url, pressable = true } = props
  const tracking = useTracking()

  const view = (
    <Flex flexDirection="row" alignItems="center">
      <Logo resizeMode="contain" source={require("@images/bmw-logo.png")} />
      <Sans size="3t" ml="1">
        {logoText}
      </Sans>
    </Flex>
  )

  if (!pressable) {
    return view
  }

  return (
    <TouchableOpacity
      onPress={() => {
        navigate(url || "https://www.bmw-arts-design.com/bmw_art_guide")

        tracking.trackEvent({
          action_name: Schema.ActionNames.BMWLogo,
          action_type: Schema.ActionTypes.Tap,
        })
      }}
    >
      {view}
    </TouchableOpacity>
  )
}

export const Logo = styled.Image`
  height: 32;
  width: 32;
`
