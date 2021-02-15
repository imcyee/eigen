import { ShowInfo_show } from "__generated__/ShowInfo_show.graphql"
import { navigate } from "lib/navigation/navigate"
import { Box, BoxProps, ChevronIcon, Text } from "palette"
import React from "react"
import { TouchableOpacity } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"

export interface ShowInfoProps extends BoxProps {
  show: ShowInfo_show
}

export const ShowInfo: React.FC<ShowInfoProps> = ({ show, ...rest }) => {
  return (
    <Box {...rest}>
      {!!show.about && (
        <Text variant="text" mb="1">
          {show.about}
        </Text>
      )}

      <TouchableOpacity onPress={() => navigate(`${show.href}/info`)}>
        <Box flexDirection="row" alignItems="center">
          <Text variant="mediumText">More info</Text>
          <ChevronIcon />
        </Box>
      </TouchableOpacity>
    </Box>
  )
}

export const ShowInfoFragmentContainer = createFragmentContainer(ShowInfo, {
  show: graphql`
    fragment ShowInfo_show on Show {
      href
      about: description
    }
  `,
})
