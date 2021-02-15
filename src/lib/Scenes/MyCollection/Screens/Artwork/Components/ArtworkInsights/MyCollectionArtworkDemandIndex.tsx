import { ContextModule, OwnerType, tappedInfoBubble } from "@artsy/cohesion"
import { MyCollectionArtworkDemandIndex_artwork } from "__generated__/MyCollectionArtworkDemandIndex_artwork.graphql"
import { MyCollectionArtworkDemandIndex_marketPriceInsights } from "__generated__/MyCollectionArtworkDemandIndex_marketPriceInsights.graphql"
import { InfoButton } from "lib/Components/Buttons/InfoButton"
import { TriangleDown } from "lib/Icons/TriangleDown"
import { ScreenMargin } from "lib/Scenes/MyCollection/Components/ScreenMargin"
import { Box, Flex, Spacer, Text } from "palette"
import React from "react"
import LinearGradient from "react-native-linear-gradient"
import { createFragmentContainer, graphql } from "react-relay"
import { useTracking } from "react-tracking"

interface MyCollectionArtworkDemandIndexProps {
  artwork: MyCollectionArtworkDemandIndex_artwork
  marketPriceInsights: MyCollectionArtworkDemandIndex_marketPriceInsights
}

const MyCollectionArtworkDemandIndex: React.FC<MyCollectionArtworkDemandIndexProps> = ({
  artwork,
  marketPriceInsights,
}) => {
  const { trackEvent } = useTracking()
  if (!artwork || !marketPriceInsights) {
    return null
  }

  const demandRank = Number((marketPriceInsights.demandRank! * 10).toFixed(2))

  return (
    <ScreenMargin>
      <InfoButton
        title="Demand index"
        modalContent={
          <>
            <Spacer my="1" />
            <Text>
              Overall strength of demand for this artist and medium combination. Based on the last 36 months of auction
              sale data from top commercial auction houses.
            </Text>
          </>
        }
        onPress={() => trackEvent(tracks.tappedInfoBubble(artwork?.internalID, artwork?.slug))}
      />

      <Spacer my="0.5" />
      <DemandRankScale demandRank={demandRank} />
      <Spacer my="1" />
      <DemandRankDetails demandRank={demandRank}></DemandRankDetails>
    </ScreenMargin>
  )
}

const DemandRankDetails: React.FC<{ demandRank: number }> = ({ demandRank }) => {
  const Bubble: React.FC<{ title: string; subTitle: string }> = ({ title, subTitle }) => (
    <Box>
      <Text>{title}</Text>
      <Text color="black60">{subTitle}</Text>
    </Box>
  )

  const getContent = () => {
    switch (true) {
      case demandRank >= 9: {
        return (
          <Bubble
            title="Very Strong Demand (> 9.0)"
            subTitle="This is a great time to sell. Works like these are highly sought after."
          />
        )
      }
      case demandRank >= 7 && demandRank < 9: {
        return (
          <Bubble
            title="Strong Demand (7.0 – 9.0)"
            subTitle="There are more collectors looking to buy works like these than there are available."
          />
        )
      }
      case demandRank >= 4 && demandRank < 7: {
        return <Bubble title="Stable Market (4.0 – 7.0)" subTitle="The market is neutral for buying and selling." />
      }
      case demandRank < 4: {
        return (
          <Bubble
            title="Less Active Market  (< 4.0)"
            subTitle="The market for selling isn’t very active yet. We will notify you when the market changes."
          />
        )
      }
    }
  }
  const content = getContent()
  return <>{content}</>
}

const DemandRankScale: React.FC<{ demandRank: number }> = ({ demandRank }) => {
  let width = demandRank * 10
  if (width > 100) {
    width = 100
  }

  let adjustedDemandRank = demandRank.toFixed(1)
  if (adjustedDemandRank === "10.0") {
    adjustedDemandRank = "9.9"
  }

  return (
    <>
      <Box>
        <Text variant="largeTitle" color="purple100">
          {adjustedDemandRank}
        </Text>
      </Box>
      <ProgressBar width={width} />
      <Spacer my="0.3" />
      <Flex flexDirection="row" justifyContent="space-between">
        <Text>0</Text>
        <Text>10</Text>
      </Flex>
    </>
  )
}

const ProgressBar: React.FC<{ width: number }> = ({ width }) => {
  const pctWidth = width + "%"
  const opacity = width / 100

  return (
    <>
      <Box width="100%" position="relative" height={10} left={-6}>
        <Box left={pctWidth} position="absolute">
          <TriangleDown />
        </Box>
      </Box>
      <Box height={24} width="100%" bg="black5">
        <LinearGradient
          colors={["rgba(243, 240, 248, 2.6)", `rgba(110, 30, 255, ${opacity})`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: pctWidth,
            height: 24,
          }}
        />
      </Box>
    </>
  )
}

export const MyCollectionArtworkDemandIndexFragmentContainer = createFragmentContainer(MyCollectionArtworkDemandIndex, {
  marketPriceInsights: graphql`
    fragment MyCollectionArtworkDemandIndex_marketPriceInsights on MarketPriceInsights {
      demandRank
    }
  `,
  artwork: graphql`
    fragment MyCollectionArtworkDemandIndex_artwork on Artwork {
      internalID
      slug
    }
  `,
})

export const tests = {
  DemandRankScale,
  DemandRankDetails,
}

const tracks = {
  tappedInfoBubble: (internalID: string, slug: string) => {
    return tappedInfoBubble({
      contextModule: ContextModule.myCollectionArtwork,
      contextScreenOwnerType: OwnerType.myCollectionArtwork,
      contextScreenOwnerId: internalID,
      contextScreenOwnerSlug: slug,
      subject: "demandIndex",
    })
  },
}
