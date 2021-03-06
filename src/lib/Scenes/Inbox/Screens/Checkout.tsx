import { FancyModalHeader } from "lib/Components/FancyModal/FancyModalHeader"
import Spinner from "lib/Components/Spinner"
import { dismissModal } from "lib/navigation/navigate"
import { getCurrentEmissionState } from "lib/store/GlobalStore"
import { useScreenDimensions } from "lib/utils/useScreenDimensions"
import React, { useState } from "react"
import { KeyboardAvoidingView, View } from "react-native"
import WebView from "react-native-webview"

export const Checkout: React.FC<{ orderID: string }> = ({ orderID }) => {
  const webCheckoutUrl = `${getCurrentEmissionState().webURL}/orders/${orderID}`
  const paddingTop = useScreenDimensions().safeAreaInsets.top

  const [isLoading, setLoading] = useState(false)
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={useScreenDimensions().safeAreaInsets.top}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, flexDirection: "column" }}>
        <FancyModalHeader
          onLeftButtonPress={() => {
            dismissModal()
          }}
          leftButtonText="Cancel"
          rightButtonDisabled
          rightButtonText=" "
        >
          Make Offer
        </FancyModalHeader>
        <WebView
          onLoadStart={() => {
            setLoading(true)
          }}
          onLoadEnd={() => {
            setLoading(false)
          }}
          source={{ uri: webCheckoutUrl }}
          style={{ marginTop: paddingTop, flex: 1 }}
        />
        {!!isLoading && <Spinner style={{ flex: 1, marginBottom: "60%" }} />}
      </View>
    </KeyboardAvoidingView>
  )
}
