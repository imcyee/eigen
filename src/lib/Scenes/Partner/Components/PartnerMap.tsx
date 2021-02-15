import MapboxGL from "@react-native-mapbox-gl/maps"
import { PartnerMap_location } from "__generated__/PartnerMap_location.graphql"
import { cityAndPostalCode, tappedOnMap } from "lib/Components/LocationMap"
import { Pin } from "lib/Icons/Pin"
import { ArtsyMapStyleURL } from "lib/Scenes/Map/GlobalMap"
import { Box, color, Flex, Sans, Serif, Spacer } from "palette"
import React from "react"
import { TouchableOpacity } from "react-native"
import Config from "react-native-config"
import { createFragmentContainer, graphql } from "react-relay"
import styled from "styled-components/native"

MapboxGL.setAccessToken(Config.MAPBOX_API_CLIENT_KEY)

const PartnerMap: React.FC<{
  location: PartnerMap_location
}> = ({ location }) => {
  const { address, address2, city, postalCode, internalID } = location
  let { lat, lng } = location.coordinates ?? { lat: null, lng: null }
  if (lat === null) {
    lat = 0
  }
  if (lng === null) {
    lng = 0
  }

  return (
    <Box px="2" mt="2">
      <Sans size="3" weight="medium">
        {city}
      </Sans>
      <Spacer mb="0.5" />
      <TouchableOpacity onPress={() => tappedOnMap(lat, lng, address, null, null, city, postalCode)}>
        <MapWrapper>
          <MapboxGL.MapView
            style={{ height: 120 }}
            key={`${lng}`}
            styleURL={ArtsyMapStyleURL}
            logoEnabled={false}
            scrollEnabled={false}
            attributionEnabled={false}
          >
            <MapboxGL.Camera centerCoordinate={[lng, lat]} zoomLevel={14} />
            <MapboxGL.PointAnnotation id={internalID} coordinate={[lng, lat]}>
              <Pin />
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
          <Box my="2">
            {!!address && (
              <Serif size="3t" color="black60" textAlign="center">
                {address}
              </Serif>
            )}
            {!!address2 && (
              <Serif size="3t" color="black60" textAlign="center">
                {address2}
              </Serif>
            )}
            {(!!city || !!postalCode) && (
              <Serif size="3t" color="black60" textAlign="center">
                {cityAndPostalCode(city, postalCode)}
              </Serif>
            )}
          </Box>
        </MapWrapper>
      </TouchableOpacity>
    </Box>
  )
}

export const PartnerMapContainer = createFragmentContainer(PartnerMap, {
  location: graphql`
    fragment PartnerMap_location on Location {
      id
      internalID
      city
      address
      address2
      postalCode
      summary
      coordinates {
        lat
        lng
      }
    }
  `,
})

const MapWrapper = styled(Flex)`
  border-width: 1px;
  border-color: ${color("black10")};
`
