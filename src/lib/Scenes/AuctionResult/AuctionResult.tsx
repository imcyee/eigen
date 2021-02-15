import { ActionType, ContextModule, OwnerType, tappedInfoBubble, TappedInfoBubbleArgs } from "@artsy/cohesion"
import { AuctionResultQuery, AuctionResultQueryResponse } from "__generated__/AuctionResultQuery.graphql"
import { AuctionResultsMidEstimate } from "lib/Components/AuctionResult/AuctionResultMidEstimate"
import { InfoButton } from "lib/Components/Buttons/InfoButton"
import { FancyModalHeader } from "lib/Components/FancyModal/FancyModalHeader"
import { navigate } from "lib/navigation/navigate"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import { PlaceholderBox } from "lib/utils/placeholders"
import { renderWithPlaceholder } from "lib/utils/renderWithPlaceholder"
import { ProvideScreenTrackingWithCohesionSchema } from "lib/utils/track"
import { useStickyScrollHeader } from "lib/utils/useStickyScrollHeader"
import { capitalize } from "lodash"
import moment from "moment"
import { Box, Flex, NoArtworkIcon, Separator, Spacer, Text, TEXT_FONTS } from "palette"
import React, { useEffect, useState } from "react"
import { Animated, Image, TextInput, TouchableWithoutFeedback } from "react-native"
import { graphql, QueryRenderer } from "react-relay"
import { useTracking } from "react-tracking"
import { RelayModernEnvironment } from "relay-runtime/lib/store/RelayModernEnvironment"
import { getImageDimensions } from "../Sale/Components/SaleArtworkListItem"

const CONTAINER_HEIGHT = 80

interface Props {
  artist: AuctionResultQueryResponse["artist"]
  auctionResult: AuctionResultQueryResponse["auctionResult"]
}

const AuctionResult: React.FC<Props> = ({ artist, auctionResult }) => {
  const [imageHeight, setImageHeight] = useState<number>(0)
  const [imageWidth, setImageWidth] = useState<number>(0)

  const tracking = useTracking()

  if (!auctionResult) {
    // The only chance someone would land on this case is using a deep link for an auction result
    // that is no longer there
    return <Flex />
  }

  useEffect(() => {
    if (auctionResult.images?.thumbnail?.url) {
      Image.getSize(auctionResult.images.thumbnail.url, (width, height) => {
        const imageDimensions = getImageDimensions(height, width, CONTAINER_HEIGHT)
        setImageHeight(imageDimensions.height)
        setImageWidth(imageDimensions.width)
      })
    }
  }, [])

  const { headerElement, scrollProps } = useStickyScrollHeader({
    header: (
      <Flex flex={1} pl="6" pr="4" pt="0.5" flexDirection="row">
        <Text variant="mediumText" numberOfLines={1} style={{ flexShrink: 1 }}>
          {auctionResult.title}
        </Text>
        {!!auctionResult.dateText && <Text variant="mediumText">, {auctionResult.dateText}</Text>}
      </Flex>
    ),
  })

  const details = []
  const makeRow = (label: string, value: string, options?: { fullWidth?: boolean; testID?: string }) => (
    <Flex key={label} mb="1">
      <Flex style={{ opacity: 0.5 }}>
        <Separator mb="1" />
      </Flex>
      {options?.fullWidth ? (
        <Flex>
          <Text color="black60" mb="1">
            {label}
          </Text>
          <TextInput
            editable={false}
            value={value}
            multiline
            scrollEnabled={false}
            style={{
              fontFamily: TEXT_FONTS.sans,
              fontSize: 14,
            }}
          />
        </Flex>
      ) : (
        <Flex flexDirection="row" justifyContent="space-between">
          <Text style={{ width: "35%" }} color="black60">
            {label}
          </Text>
          <Flex width="65%" pl={15}>
            <TextInput
              editable={false}
              value={value}
              multiline
              testID={options?.testID}
              scrollEnabled={false}
              style={{
                fontFamily: TEXT_FONTS.sans,
                fontSize: 14,
                textAlign: "right",
                paddingLeft: 20,
              }}
            />
          </Flex>
        </Flex>
      )}
    </Flex>
  )
  if (auctionResult.estimate?.display) {
    details.push(makeRow("Pre-sale estimate", auctionResult.estimate?.display))
  }
  if (auctionResult.mediumText) {
    details.push(makeRow("Materials", capitalize(auctionResult.mediumText)))
  }
  if (auctionResult.dimensionText) {
    details.push(makeRow("Dimensions", auctionResult.dimensionText))
  }
  if (auctionResult.dateText) {
    details.push(makeRow("Artwork date", auctionResult.dateText))
  }
  if (auctionResult.saleDate) {
    details.push(
      makeRow("Sale date", moment(auctionResult.saleDate).utc().format("MMM D, YYYY"), { testID: "saleDate" })
    )
  }
  if (auctionResult.organization) {
    details.push(makeRow("Auction house", auctionResult.organization))
  }
  if (auctionResult.saleTitle) {
    details.push(makeRow("Sale name", auctionResult.saleTitle))
  }
  if (auctionResult.location) {
    details.push(makeRow("Sale location", auctionResult.location))
  }
  if (auctionResult.description) {
    details.push(makeRow("Description", auctionResult.description, { fullWidth: true }))
  }

  const hasSalePrice = !!auctionResult.priceRealized?.display
  const now = moment()
  const isFromPastMonth = auctionResult.saleDate
    ? moment(auctionResult.saleDate).isAfter(now.subtract(1, "month"))
    : false
  const salePriceMessage =
    auctionResult.boughtIn === true ? "Bought in" : isFromPastMonth ? "Awaiting results" : "Not available"

  const renderRealizedPriceModal = () => (
    <>
      <Spacer my="1" />
      <Text>
        The sale price includes the hammer price and buyer’s premium, as well as any other additional fees (e.g.,
        Artist’s Resale Rights).
      </Text>
      <Spacer mb="2" />
    </>
  )

  return (
    <ProvideScreenTrackingWithCohesionSchema info={tracks.screen(auctionResult.internalID) as any}>
      <Animated.ScrollView {...scrollProps}>
        <FancyModalHeader hideBottomDivider />
        <Box px="2" pb="4">
          <Flex mt="1" mb="4" style={{ flexDirection: "row" }}>
            {!!auctionResult.images?.thumbnail?.url && !!imageHeight && !!imageWidth ? (
              <Flex height={CONTAINER_HEIGHT} width={CONTAINER_HEIGHT} justifyContent="center">
                <Image
                  style={{ height: imageHeight, width: imageWidth }}
                  source={{ uri: auctionResult.images?.thumbnail?.url }}
                />
              </Flex>
            ) : (
              <Box
                style={{ height: CONTAINER_HEIGHT, width: CONTAINER_HEIGHT }}
                backgroundColor="black10"
                alignItems="center"
                justifyContent="center"
              >
                <NoArtworkIcon width={28} height={28} opacity="0.3" />
              </Box>
            )}
            <Flex justifyContent="center" flex={1} ml="2">
              <TouchableWithoutFeedback
                onPress={() => artist?.href && navigate(artist.href)}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
              >
                <Text variant="mediumText">{artist?.name}</Text>
              </TouchableWithoutFeedback>
              <Text variant="title">
                {auctionResult.title}
                {!!auctionResult.dateText && `, ${auctionResult.dateText}`}
              </Text>
            </Flex>
          </Flex>
          {!!hasSalePrice && (
            <Flex flexDirection="row">
              <InfoButton
                titleElement={
                  <Text variant="title" mb="1" mr="0.5">
                    Sale Price
                  </Text>
                }
                trackEvent={() => {
                  tracking.trackEvent(tappedInfoBubble(tracks.tapMarketStatsInfo()))
                }}
                modalTitle="Sale Price"
                maxModalHeight={180}
                modalContent={renderRealizedPriceModal()}
              />
            </Flex>
          )}
          {hasSalePrice ? (
            <>
              <Text variant="largeTitle" mb="0.5">{`${auctionResult.priceRealized?.display}`}</Text>
              {!!auctionResult.performance?.mid && (
                <AuctionResultsMidEstimate
                  textVariant="caption"
                  value={auctionResult.performance.mid}
                  shortDescription="mid-estimate"
                />
              )}
            </>
          ) : (
            <Text variant="largeTitle">{salePriceMessage}</Text>
          )}

          <Text variant="title" mt="4" mb="1">
            Details
          </Text>
          {details}
        </Box>
      </Animated.ScrollView>
      {headerElement}
    </ProvideScreenTrackingWithCohesionSchema>
  )
}

export const AuctionResultQueryRenderer: React.FC<{
  auctionResultInternalID: string
  artistID: string
  environment: RelayModernEnvironment
}> = ({ auctionResultInternalID, artistID, environment }) => {
  return (
    <QueryRenderer<AuctionResultQuery>
      environment={environment || defaultEnvironment}
      query={graphql`
        query AuctionResultQuery($auctionResultInternalID: String!, $artistID: String!) {
          auctionResult(id: $auctionResultInternalID) {
            internalID
            artistID
            boughtIn
            categoryText
            dateText
            description
            dimensions {
              height
              width
            }
            dimensionText
            estimate {
              display
              high
              low
            }
            images {
              thumbnail {
                url(version: "square140")
                height
                width
                aspectRatio
              }
            }
            location
            mediumText
            organization
            performance {
              mid
            }
            priceRealized {
              cents
              centsUSD
              display
            }
            saleDate
            saleTitle
            title
          }
          artist(id: $artistID) {
            name
            href
          }
        }
      `}
      variables={{
        auctionResultInternalID,
        artistID,
      }}
      render={renderWithPlaceholder({
        Container: AuctionResult,
        renderPlaceholder: LoadingSkeleton,
      })}
    />
  )
}

const LoadingSkeleton = () => {
  const details = []
  for (let i = 0; i < 8; i++) {
    details.push(
      <Flex flexDirection="row" justifyContent="space-between" mb="2" key={i}>
        <PlaceholderBox width={CONTAINER_HEIGHT + Math.round(Math.random() * CONTAINER_HEIGHT)} height={20} />
        <PlaceholderBox width={CONTAINER_HEIGHT + Math.round(Math.random() * CONTAINER_HEIGHT)} height={20} />
      </Flex>
    )
  }
  return (
    <Flex mx="2">
      <Spacer height={70} />

      <Flex flexDirection="row">
        {/* Image */}
        <PlaceholderBox width={CONTAINER_HEIGHT} height={CONTAINER_HEIGHT} />
        <Flex ml="2" mt="1">
          {/* Artist name */}
          <PlaceholderBox width={100} height={20} />
          <Spacer mb="1" />
          {/* Artwork name */}
          <PlaceholderBox width={150} height={25} />
        </Flex>
      </Flex>
      <Spacer mb="4" />
      {/* "Realized price" */}
      <PlaceholderBox width={100} height={15} />
      <Spacer mb="1" />
      {/* Price */}
      <PlaceholderBox width={120} height={40} />
      <Spacer mb="1" />
      {/* Ratio */}
      <PlaceholderBox width={200} height={20} />
      <Spacer mb="4" />
      {/* "details" */}
      <PlaceholderBox width={60} height={30} />
      <Spacer mb="2" />
      {details}
    </Flex>
  )
}

export const tracks = {
  screen: (id: string) => ({
    action: ActionType.screen,
    context_screen_owner_type: OwnerType.auctionResult,
    context_screen_owner_id: id,
  }),

  tapMarketStatsInfo: (): TappedInfoBubbleArgs => ({
    contextModule: ContextModule.auctionResult,
    contextScreenOwnerType: OwnerType.artistInsights,
    subject: "auctionResultSalePrice",
  }),
}
