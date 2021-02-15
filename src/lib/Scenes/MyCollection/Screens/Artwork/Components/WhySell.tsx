import { ScreenMargin } from "lib/Scenes/MyCollection/Components/ScreenMargin"
import { Box, Flex, Join, Separator, Spacer, Text } from "palette"
import React from "react"

export const WhySell: React.FC = () => {
  return (
    <>
      <Separator />
      <Spacer my="1" />

      <ScreenMargin>
        <Join separator={<Spacer my="1" />}>
          <Text variant="title">Interested in selling this work?</Text>
          <WhySellStep
            step={1}
            title="Simple Steps"
            description="Submit your work once, pick the best offer, and ship the work when it sells."
          />
          <WhySellStep
            step={2}
            title="Industry Expertise"
            description="Receive virtual valuation and expert guidance on the best sales strategies."
          />
          <WhySellStep
            step={3}
            title="Global Reach"
            description="Your work will reach the world's collectors, galleries, and auction houses."
          />
        </Join>
      </ScreenMargin>
    </>
  )
}

const WhySellStep: React.FC<{ step: number; title: string; description: string }> = ({ step, title, description }) => {
  return (
    <Flex flexDirection="row">
      <Box mr="2">
        <Text>{step}</Text>
      </Box>
      <Box mr="2">
        <Text>{title}</Text>
        <Text color="black60">{description}</Text>
      </Box>
    </Flex>
  )
}
