import { ViewingRoomHeader_viewingRoom } from "__generated__/ViewingRoomHeader_viewingRoom.graphql"
import { durationSections } from "lib/Components/Countdown"
import { CountdownProps, CountdownTimer } from "lib/Components/Countdown/CountdownTimer"
import OpaqueImageView from "lib/Components/OpaqueImageView/OpaqueImageView"
import { navigate } from "lib/navigation/navigate"
import { Box, Flex, space, Text } from "palette"
import React from "react"
import { Dimensions, TouchableWithoutFeedback, View } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { createFragmentContainer, graphql } from "react-relay"
import styled from "styled-components/native"
import { ViewingRoomStatus } from "../ViewingRoom"

interface ViewingRoomHeaderProps {
  viewingRoom: ViewingRoomHeader_viewingRoom
}

export const BackgroundImage = styled(OpaqueImageView)<{ height: number; width: number }>`
  position: absolute;
  height: 100%;
  width: 100%;
`

const CountdownContainer = styled.View`
  position: absolute;
  bottom: ${space(2)};
  right: ${space(2)};
  width: 45%;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 20;
`

const PartnerContainer = styled(Flex)`
  position: absolute;
  bottom: ${space(2)};
  left: ${space(2)};
  width: 45%;
  flex-direction: row;
`

const Overlay = styled(LinearGradient)`
  width: 100%;
  height: 100%;
  position: absolute;
  opacity: 0.15;
`

const CountdownText: React.FC<CountdownProps> = ({ duration }) => {
  const separator = "  "
  const sections = durationSections(duration, ["d", "h", "m", "s"])
  return (
    <Text variant="small" fontWeight={500} color="white100">
      {sections
        .map(({ time, label }, idx) => (idx < sections.length - 1 ? time + label + separator : time + label))
        .join("")}
    </Text>
  )
}

const Countdown: React.FC<{ startAt: string; endAt: string; status: string }> = ({ startAt, endAt, status }) => {
  let finalText = ""
  if (status === ViewingRoomStatus.CLOSED) {
    finalText = "Closed"
  } else if (status === ViewingRoomStatus.SCHEDULED) {
    finalText = "Opens in "
  } else if (status === ViewingRoomStatus.LIVE) {
    finalText = "Closes in "
  }

  if (finalText === "") {
    return null
  }

  return (
    <>
      <Text variant="small" fontWeight={500} color="white100">
        {finalText}
      </Text>
      {status !== ViewingRoomStatus.CLOSED ? (
        <CountdownTimer startAt={startAt} endAt={endAt} countdownComponent={CountdownText} />
      ) : null}
    </>
  )
}

export const PartnerIconImage = styled.Image`
  border-radius: 100;
`

export const ViewingRoomHeader: React.FC<ViewingRoomHeaderProps> = (props) => {
  const { heroImage, title, partner, startAt, endAt, status } = props.viewingRoom
  const partnerIconImageURL = partner?.profile?.icon?.url
  const { width: screenWidth } = Dimensions.get("window")
  const imageHeight = 547

  return (
    <View>
      <Box style={{ height: imageHeight, width: screenWidth, position: "relative" }}>
        <BackgroundImage
          data-test-id="background-image"
          imageURL={heroImage?.imageURLs?.normalized ?? ""}
          height={imageHeight}
          width={screenWidth}
        />
        <Overlay colors={["rgba(255, 255, 255, 0)", "rgba(0, 0, 0, 1)"]} />
        <Flex flexDirection="row" justifyContent="center" alignItems="flex-end" px="2" height={imageHeight - 60}>
          <Flex alignItems="center" flexDirection="column" flexGrow={1}>
            <Text data-test-id="title" variant="largeTitle" textAlign="center" color="white100">
              {title}
            </Text>
          </Flex>
        </Flex>
        <PartnerContainer>
          <TouchableWithoutFeedback onPress={() => navigate(partner!.href!)}>
            <Flex flexDirection="row" justifyContent="center" alignItems="center">
              {!!partnerIconImageURL && (
                <Box mr="0.5">
                  <PartnerIconImage
                    source={{ uri: partnerIconImageURL, width: 20, height: 20 }}
                    data-test-id="partner-icon"
                  />
                </Box>
              )}
              <Text variant="small" fontWeight={500} color="white100" data-test-id="partner-name">
                {partner!.name}
              </Text>
            </Flex>
          </TouchableWithoutFeedback>
        </PartnerContainer>
        <CountdownContainer>
          <Flex alignItems="flex-end" flexDirection="row">
            <Countdown startAt={startAt as string} endAt={endAt as string} status={status} />
          </Flex>
        </CountdownContainer>
      </Box>
    </View>
  )
}

export const ViewingRoomHeaderContainer = createFragmentContainer(ViewingRoomHeader, {
  viewingRoom: graphql`
    fragment ViewingRoomHeader_viewingRoom on ViewingRoom {
      title
      startAt
      endAt
      status
      heroImage: image {
        imageURLs {
          normalized
        }
      }
      partner {
        name
        href
        profile {
          icon {
            url(version: "square")
          }
        }
      }
    }
  `,
})
