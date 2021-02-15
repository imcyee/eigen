import ChevronIcon from "lib/Icons/ChevronIcon"
import { Box, Flex, Sans } from "palette"
import React from "react"
import { GestureResponderEvent, TouchableOpacity } from "react-native"

interface Props {
  onPress?: (ev: GestureResponderEvent) => void
  text: string
  textColor?: string
}

export const CaretButton: React.FC<Props> = ({ text, onPress, textColor }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Flex flexDirection="row" align-items="base-line">
        <Sans size="3t" weight="medium" color={textColor}>
          {text}
        </Sans>
        <Box ml="0.5" style={{ marginTop: 1.5 }}>
          <ChevronIcon />
        </Box>
      </Flex>
    </TouchableOpacity>
  )
}
