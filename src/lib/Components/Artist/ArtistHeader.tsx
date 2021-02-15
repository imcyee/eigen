import { ArtistHeader_artist } from "__generated__/ArtistHeader_artist.graphql"
import { ArtistHeaderFollowArtistMutation } from "__generated__/ArtistHeaderFollowArtistMutation.graphql"
import { userHadMeaningfulInteraction } from "lib/NativeModules/Events"
import { formatLargeNumberOfItems } from "lib/utils/formatLargeNumberOfItems"
import { Box, bullet, Button, Flex, Sans, Spacer } from "palette"
import React, { useState } from "react"
import { Text } from "react-native"
import { commitMutation, createFragmentContainer, graphql, RelayProp } from "react-relay"
import { useTracking } from "react-tracking"
import styled from "styled-components/native"
import { Schema } from "../../utils/track"

interface Props {
  artist: ArtistHeader_artist
  relay: RelayProp
}

export const ArtistHeader: React.FC<Props> = ({ artist, relay }) => {
  const { trackEvent } = useTracking()

  const [isFollowedChanging, setIsFollowedChanging] = useState<boolean>(false)
  const followersCount = artist.counts?.follows ?? 0

  const getBirthdayString = () => {
    const birthday = artist.birthday
    if (!birthday) {
      return ""
    }

    const leadingSubstring = artist.nationality ? ", b." : ""

    if (birthday.includes("born")) {
      return birthday.replace("born", leadingSubstring)
    } else if (birthday.includes("Est.") || birthday.includes("Founded")) {
      return " " + birthday
    }

    return leadingSubstring + " " + birthday
  }

  const handleFollowChange = () => {
    trackEvent({
      action_name: artist.isFollowed ? Schema.ActionNames.ArtistUnfollow : Schema.ActionNames.ArtistFollow,
      action_type: Schema.ActionTypes.Tap,
      owner_id: artist.internalID,
      owner_slug: artist.slug,
      owner_type: Schema.OwnerEntityTypes.Artist,
    })

    if (isFollowedChanging) {
      return
    }

    setIsFollowedChanging(true)

    commitMutation<ArtistHeaderFollowArtistMutation>(relay.environment, {
      onCompleted: () => successfulFollowChange(),
      mutation: graphql`
        mutation ArtistHeaderFollowArtistMutation($input: FollowArtistInput!) {
          followArtist(input: $input) {
            artist {
              id
              isFollowed
            }
          }
        }
      `,
      variables: {
        input: {
          artistID: artist.slug,
          unfollow: artist.isFollowed,
        },
      },
      optimisticResponse: {
        followArtist: {
          artist: {
            id: artist.id,
            isFollowed: !artist.isFollowed,
          },
        },
      },
      onError: () => failedFollowChange(),
    })
  }

  const successfulFollowChange = () => {
    trackEvent({
      action_name: artist.isFollowed ? Schema.ActionNames.ArtistFollow : Schema.ActionNames.ArtistUnfollow,
      action_type: Schema.ActionTypes.Success,
      owner_id: artist.internalID,
      owner_slug: artist.slug,
      owner_type: Schema.OwnerEntityTypes.Artist,
    })

    // callback for analytics purposes
    userHadMeaningfulInteraction()
    setIsFollowedChanging(false)
  }

  const failedFollowChange = () => {
    trackEvent({
      action_name: artist.isFollowed ? Schema.ActionNames.ArtistFollow : Schema.ActionNames.ArtistUnfollow,
      action_type: Schema.ActionTypes.Fail,
      owner_id: artist.internalID,
      owner_slug: artist.slug,
      owner_type: Schema.OwnerEntityTypes.Artist,
    })
    // callback for analytics purposes
    setIsFollowedChanging(false)
  }

  const descriptiveString = (artist.nationality || "") + getBirthdayString()

  const bylineRequired = artist.nationality || artist.birthday

  return (
    <Box px="2" pt="6" pb="1">
      <Sans size="8">{artist.name}</Sans>
      <Spacer mb="1" />
      {Boolean(followersCount || bylineRequired) && (
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          <Flex flex={1}>
            {!!bylineRequired && (
              <Sans mr="1" size="3t">
                {descriptiveString}
              </Sans>
            )}
            <Sans size="3t">
              {formatLargeNumberOfItems(artist.counts?.artworks ?? 0, "work")}
              {` ${bullet} `}
              {formatLargeNumberOfItems(artist.counts?.follows ?? 0, "follower")}
            </Sans>
          </Flex>
          <Flex>
            <Button
              variant={artist.isFollowed ? "secondaryOutline" : "primaryBlack"}
              loading={isFollowedChanging}
              onPress={handleFollowChange}
              size="small"
              longestText="Following"
              haptic
            >
              {artist.isFollowed ? "Following" : "Follow"}
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  )
}

export const ArtistHeaderFragmentContainer = createFragmentContainer(ArtistHeader, {
  artist: graphql`
    fragment ArtistHeader_artist on Artist {
      id
      internalID
      slug
      isFollowed
      name
      nationality
      birthday
      counts {
        artworks
        follows
      }
    }
  `,
})

export const TextWrapper = styled(Text)``
