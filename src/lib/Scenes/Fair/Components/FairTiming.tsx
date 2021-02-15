import { FairTiming_fair } from "__generated__/FairTiming_fair.graphql"
import { EventTiming } from "lib/Components/EventTiming"
import { WithCurrentTime } from "lib/Components/WithCurrentTime"
import { Box, Text } from "palette"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"

interface FairTimingProps {
  fair: FairTiming_fair
}

export const FairTiming: React.FC<FairTimingProps> = ({ fair: { exhibitionPeriod, startAt, endAt } }) => {
  return (
    <Box py="1">
      <Text variant="mediumText" color="black100">
        {exhibitionPeriod}
      </Text>
      <Text variant="text" color="black60">
        <WithCurrentTime syncWithServer>
          {(currentTime) => {
            const props = {
              currentTime,
              startAt,
              endAt,
            }
            return <EventTiming {...props} />
          }}
        </WithCurrentTime>
      </Text>
    </Box>
  )
}

export const FairTimingFragmentContainer = createFragmentContainer(FairTiming, {
  fair: graphql`
    fragment FairTiming_fair on Fair {
      exhibitionPeriod
      startAt
      endAt
    }
  `,
})
