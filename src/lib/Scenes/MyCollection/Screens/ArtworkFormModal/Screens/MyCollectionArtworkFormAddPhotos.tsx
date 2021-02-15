import { StackScreenProps } from "@react-navigation/stack"
import { FancyModalHeader } from "lib/Components/FancyModal/FancyModalHeader"
import { Stack } from "lib/Components/Stack"
import { Image as ImageProps } from "lib/Scenes/MyCollection/State/MyCollectionArtworkModel"
import { GlobalStore } from "lib/store/GlobalStore"
import { isPad } from "lib/utils/hardware"
import { useScreenDimensions } from "lib/utils/useScreenDimensions"
import { chunk } from "lodash"
import { AddIcon, BorderBox, Box, color, Flex, XCircleIcon } from "palette"
import React from "react"
import { Image, ScrollView, TouchableOpacity } from "react-native"
import { ArtworkFormModalScreen } from "../MyCollectionArtworkFormModal"

const MARGIN = 20

export const MyCollectionAddPhotos: React.FC<StackScreenProps<ArtworkFormModalScreen, "AddPhotos">> = ({
  navigation,
}) => {
  const formValues = GlobalStore.useAppState((state) => state.myCollection.artwork.sessionState.formValues)
  const { photos } = formValues
  const { width: screenWidth } = useScreenDimensions()
  const numColumns = isPad() ? 5 : 2
  const imageSize = (screenWidth - MARGIN) / numColumns - MARGIN
  const items = [<AddPhotosButton key="button" imageSize={imageSize} />].concat(
    photos.map((photo, index) => {
      return (
        <Box key={index}>
          <Image
            style={{ width: imageSize, height: imageSize, resizeMode: "cover" }}
            source={{ uri: photo.imageURL?.replace(":version", "medium") || photo.path }}
          />
          <DeletePhotoButton photo={photo} />
        </Box>
      )
    })
  )
  const rows = chunk(items, numColumns)

  return (
    <>
      <FancyModalHeader onLeftButtonPress={() => navigation.goBack()}>
        Photos {!!photos.length && `(${photos.length})`}
      </FancyModalHeader>
      <ScrollView>
        <Flex flexDirection="row" flexWrap="wrap" my="2">
          {rows.map((row, i) => (
            <Stack horizontal key={i} mb="2" mx="2">
              {row}
            </Stack>
          ))}
        </Flex>
      </ScrollView>
    </>
  )
}

const AddPhotosButton: React.FC<{ imageSize: number }> = ({ imageSize }) => {
  const artworkActions = GlobalStore.actions.myCollection.artwork

  return (
    <TouchableOpacity onPress={() => artworkActions.takeOrPickPhotos()}>
      <BorderBox p={0} bg={color("white100")} width={imageSize} height={imageSize} key="addMorePhotos">
        <Flex flex={1} flexDirection="row" justifyContent="center" alignItems="center">
          <AddIcon width={30} height={30} />
        </Flex>
      </BorderBox>
    </TouchableOpacity>
  )
}

const DeletePhotoButton: React.FC<{ photo: ImageProps }> = ({ photo }) => {
  const artworkActions = GlobalStore.actions.myCollection.artwork

  return (
    <Box position="absolute" right={-4} top="-5">
      <TouchableOpacity
        hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
        onPress={() => artworkActions.removePhoto(photo)}
      >
        <XCircleIcon width={20} height={20} />
      </TouchableOpacity>
    </Box>
  )
}

export const tests = {
  AddPhotosButton,
  DeletePhotoButton,
}
