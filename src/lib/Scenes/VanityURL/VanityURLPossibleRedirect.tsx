import { ArtsyWebView } from "lib/Components/ArtsyWebView"
import { Stack } from "lib/Components/Stack"
import { goBack, navigate } from "lib/navigation/navigate"
import { matchRoute } from "lib/navigation/routes"
import { GlobalStore } from "lib/store/GlobalStore"
import { Button, Flex, Spinner, Text } from "palette"
import React, { useEffect, useState } from "react"
import { Linking, Platform } from "react-native"

function join(...parts: string[]) {
  return parts.map((s) => s.replace(/(^\/+|\/+$)/g, "")).join("/")
}

export const VanityURLPossibleRedirect: React.FC<{ slug: string }> = ({ slug }) => {
  const [jsx, setJSX] = useState(<Loading />)

  const { authenticationToken, webURL } =
    // TODO: resolve these once android onboarding and user env config are done
    Platform.OS === "ios"
      ? GlobalStore.useAppState((store) => store.native.sessionState)
      : GlobalStore.useAppState((store) => {
          return {
            authenticationToken: store.auth.userAccessToken!,
            webURL: store.config.sessionState.webURL,
          }
        })
  const resolvedURL = join(webURL, slug)

  useEffect(() => {
    fetch(resolvedURL, {
      method: "HEAD",
      headers: { "X-Access-Token": authenticationToken },
    })
      .then((response) => {
        if (!response.ok) {
          // Test this with any junk, e.g. `artsy:///asdfasdfasdf`
          setJSX(<NotFound url={resolvedURL} />)
          return
        }

        const screen = matchRoute(response.url)
        if (screen.type === "external_url") {
          // not sure if we have any URLs in force that would trigger this, but better safe than sorry!
          goBack()
          navigate(response.url)
        } else if (screen.module === "WebView") {
          // Test this with `artsy:///artsy-vanguard-2019` which force should redirect to /series/artsy-vanguard-2019
          setJSX(<ArtsyWebView url={response.url} />)
        } else if (screen.module === "VanityURLEntity" && slug === (screen.params as any).slug) {
          // No redirect, it's some other kind of single-segment URI path.
          // Just show the web version of this page.
          // Test this with `artsy:///identity-verification-faq`
          setJSX(<ArtsyWebView url={response.url} />)
        } else {
          // The app has a native screen for the redirect URL, let's show it.
          // Test this with `artsy:///auction` which force should redirect to /auctions

          // TODO: add `replace` mode of navigation
          goBack()
          navigate(response.url)
        }
      })
      .catch(() => {
        setJSX(<NotFound url={resolvedURL} />)
      })
  }, [])

  return jsx
}

const Loading: React.FC<{}> = ({}) => {
  return (
    <Flex style={{ flex: 1 }} flexDirection="row" alignItems="center" justifyContent="center">
      <Spinner />
    </Flex>
  )
}

const NotFound: React.FC<{ url: string }> = ({ url }) => {
  return (
    <Stack style={{ flex: 1 }} mx="2" alignItems="center" justifyContent="center">
      <Text variant="largeTitle">404</Text>
      <Text variant="text" textAlign="center">
        We can't find that page.
      </Text>

      <Button
        variant="secondaryOutline"
        onPress={() => {
          Linking.openURL(url)
        }}
      >
        Open in browser
      </Button>
    </Stack>
  )
}
