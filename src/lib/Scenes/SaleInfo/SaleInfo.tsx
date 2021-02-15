import { SaleInfo_me } from "__generated__/SaleInfo_me.graphql"
import { SaleInfo_sale } from "__generated__/SaleInfo_sale.graphql"
import { SaleInfoQueryRendererQuery } from "__generated__/SaleInfoQueryRendererQuery.graphql"
import { MenuItem } from "lib/Components/MenuItem"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import { PlaceholderText } from "lib/utils/placeholders"
import { renderWithPlaceholder } from "lib/utils/renderWithPlaceholder"
import moment from "moment"
import { Flex, Join, Sans, Separator, Text } from "palette"
import React, { useEffect, useRef } from "react"
import { PanResponder, ScrollView, View } from "react-native"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"

import { ContextModule, OwnerType } from "@artsy/cohesion"
import { StyledWebView } from "lib/Components/StyledWebView"
import { sendEmail } from "lib/utils/sendEmail"
import { ProvideScreenTracking, Schema } from "lib/utils/track"
import { navigate } from "../../navigation/navigate"
import { PlaceholderBox } from "../../utils/placeholders"
import { RegisterToBidButtonContainer } from "../Sale/Components/RegisterToBidButton"
import { saleStatus } from "../Sale/helpers"

interface Props {
  sale: SaleInfo_sale
  me: SaleInfo_me
}

const AuctionSupport = () => {
  return (
    <Flex mt="1">
      <Text variant="subtitle" px="2" mb={15}>
        Auction support
      </Text>
      <MenuItem
        title="Auction FAQs"
        onPress={() => {
          navigate("/auction-faq")
        }}
      />
      <MenuItem
        title="Contact us for help"
        onPress={() => {
          sendEmail("specialist@artsy.net")
        }}
      />
    </Flex>
  )
}

const AuctionIsLive = () => (
  <Flex px="2" data-test-id="live-auction">
    <Sans size="5t" mb="2" mt="1">
      This is a live auction
    </Sans>
    <Text variant="text" color="black" fontSize="size4">
      Participating in a live auction means you’ll be competing against bidders in real time on an auction room floor.
      You can place max bids which will be represented by Artsy in the auction room or you can bid live when the auction
      opens.
    </Text>
  </Flex>
)

export const SaleInfo: React.FC<Props> = ({ sale, me }) => {
  const panResponder = useRef<any>(null)
  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
    })
  }, [])

  const renderLiveBiddingOpening = () => {
    if (!sale.liveStartAt || !moment().isSameOrBefore(moment(sale.liveStartAt)) || !sale.timeZone) {
      return null
    }

    return (
      <Flex mb="1">
        <Text variant="text" color="black" fontSize="size4" mt={25} fontWeight="500">
          Live bidding opens on
        </Text>
        <Text variant="text" color="black" fontSize="size4">
          {`${moment(sale.liveStartAt).format("dddd, MMMM, D, YYYY")} at ${moment(sale.liveStartAt).format(
            "h:mma"
          )} ${moment.tz(sale.timeZone).zoneAbbr()}`}
        </Text>
      </Flex>
    )
  }

  return (
    <ProvideScreenTracking info={tracks.screen(sale.internalID, sale.slug)}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Join separator={<Separator my="2" />}>
          {/*  About Auction */}
          <Flex px="2" mt={70}>
            <Sans size="8">About this auction</Sans>
            <Sans size="5" mt="1" mb="3">
              {sale.name}
            </Sans>
            {saleStatus(sale.startAt, sale.endAt, sale.registrationEndsAt) === "closed" || (
              <Flex mb="4">
                <RegisterToBidButtonContainer
                  sale={sale}
                  contextType={OwnerType.saleInformation}
                  me={me}
                  contextModule={ContextModule.aboutThisAuction}
                />
              </Flex>
            )}
            <View {...(panResponder.current?.panHandlers || {})}>
              <StyledWebView body={sale.description || ""} />
            </View>
            {renderLiveBiddingOpening()}
          </Flex>

          {Boolean(sale.liveStartAt) && <AuctionIsLive />}
          {!!sale.isWithBuyersPremium && <BuyersPremium sale={sale} />}
          <AuctionSupport />
        </Join>
      </ScrollView>
    </ProvideScreenTracking>
  )
}

const createPremiumDisplay = (props: { sale: SaleInfo_sale }) => {
  return props.sale.buyersPremium?.map((item, index) => (
    <BuyersPremiumItem sale={props.sale} currentValue={item} index={index} key={index} />
  ))
}

interface BuyersPremiumItemProps {
  sale: SaleInfo_sale
  currentValue: {
    amount: string | null
    percent: number | null
  } | null
  index: number
}

const BuyersPremiumItem: React.FC<BuyersPremiumItemProps> = (props) => {
  let premiumText

  const buyersPremium = props.sale.buyersPremium
  const amount = props.currentValue?.amount
  const percent = (props.currentValue?.percent || 0) * 100 + "%"
  const listLength = props.sale.buyersPremium?.length || 0

  const nextValue = !!buyersPremium ? buyersPremium[props.index + 1] : null

  if (props.index === 0) {
    premiumText = `On the hammer price up to and including ${nextValue?.amount}: ${percent}`
  } else if (props.index === listLength - 1) {
    premiumText = `On the portion of the hammer price in excess of ${amount}: ${percent}`
  } else {
    premiumText = `On the hammer price in excess of ${amount} up to and including ${nextValue?.amount}: ${percent}`
  }
  return (
    <Text variant="text" mb="1">
      {premiumText}
    </Text>
  )
}

const BuyersPremium: React.FC<{ sale: SaleInfo_sale }> = (props) => {
  let premiumDisplay

  const buyersPremium = props.sale.buyersPremium
  if (!buyersPremium || buyersPremium?.length === 0) {
    return null
  }

  if (buyersPremium.length === 1) {
    premiumDisplay = <Text variant="text">{(buyersPremium[0]?.percent || 0) * 100}% on the hammer price</Text>
  } else {
    premiumDisplay = createPremiumDisplay(props)
  }
  return (
    <Flex px="2">
      <Text variant="subtitle" mb="2" mt="1">
        Buyer's Premium for this Auction
      </Text>
      {premiumDisplay}
    </Flex>
  )
}

const SaleInfoPlaceholder = () => (
  <Join separator={<Separator my="2" />}>
    <Flex px="2" mt={70}>
      <Sans size="8">About this auction</Sans>
      <Separator my="1" />
      <PlaceholderBox marginBottom={20} height={30} width={200 + Math.random() * 100} />
      <PlaceholderBox marginBottom={10} height={50} />
      <PlaceholderText marginBottom={20} height={30} width={200 + Math.random() * 100} />
      <PlaceholderBox marginBottom={10} height={120 + Math.random() * 100} width="100%" />
      <PlaceholderBox marginBottom={10} height={120 + Math.random() * 100} width="100%" />
      <PlaceholderBox marginBottom={10} height={120 + Math.random() * 100} width="100%" />
    </Flex>
  </Join>
)

export const tracks = {
  screen: (id: string, slug: string) => {
    return {
      context_screen: Schema.PageNames.AuctionInfo,
      context_screen_owner_type: Schema.OwnerEntityTypes.AuctionInfo,
      context_screen_owner_id: id,
      context_screen_owner_slug: slug,
    }
  },
}

export const SaleInfoContainer = createFragmentContainer(SaleInfo, {
  sale: graphql`
    fragment SaleInfo_sale on Sale {
      ...RegisterToBidButton_sale
      description
      slug
      internalID
      endAt
      liveStartAt
      name
      startAt
      registrationEndsAt
      timeZone
      isWithBuyersPremium
      buyersPremium {
        amount
        percent
      }
    }
  `,
  me: graphql`
    fragment SaleInfo_me on Me {
      ...RegisterToBidButton_me @arguments(saleID: $saleID)
    }
  `,
})

export const SaleInfoQueryRenderer: React.FC<{ saleID: string }> = ({ saleID: saleID }) => {
  return (
    <QueryRenderer<SaleInfoQueryRendererQuery>
      environment={defaultEnvironment}
      query={graphql`
        query SaleInfoQueryRendererQuery($saleID: String!) {
          sale(id: $saleID) {
            ...SaleInfo_sale
          }
          me {
            ...SaleInfo_me
          }
        }
      `}
      variables={{ saleID }}
      render={renderWithPlaceholder({ Container: SaleInfoContainer, renderPlaceholder: SaleInfoPlaceholder })}
    />
  )
}

export const tests = { AuctionSupport, AuctionIsLive }
