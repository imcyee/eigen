import React from "react"
import { RefreshControl } from "react-native"
import { createPaginationContainer, graphql, QueryRenderer, RelayPaginationProp } from "react-relay"

import { SavedItemRow } from "lib/Components/Lists/SavedItemRow"
import Spinner from "lib/Components/Spinner"
import { ZeroState } from "lib/Components/States/ZeroState"
import { PAGE_SIZE } from "lib/data/constants"

import { FavoriteCategories_me } from "__generated__/FavoriteCategories_me.graphql"
import { StickyTabPageFlatList } from "lib/Components/StickyTabPage/StickyTabPageFlatList"
import { StickyTabPageScrollView } from "lib/Components/StickyTabPage/StickyTabPageScrollView"
import { extractNodes } from "lib/utils/extractNodes"
import { Spacer } from "palette"

import { FavoriteCategoriesQuery } from "__generated__/FavoriteCategoriesQuery.graphql"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import renderWithLoadProgress from "lib/utils/renderWithLoadProgress"

interface Props {
  me: FavoriteCategories_me
  relay: RelayPaginationProp
}

interface State {
  fetchingMoreData: boolean
  refreshingFromPull: boolean
}

export class Categories extends React.Component<Props, State> {
  state = {
    fetchingMoreData: false,
    refreshingFromPull: false,
  }

  loadMore = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return
    }

    this.setState({ fetchingMoreData: true })
    this.props.relay.loadMore(PAGE_SIZE, (error) => {
      if (error) {
        // FIXME: Handle error
        console.error("Categories/index.tsx", error.message)
      }
      this.setState({ fetchingMoreData: false })
    })
  }

  handleRefresh = () => {
    this.setState({ refreshingFromPull: true })
    this.props.relay.refetchConnection(PAGE_SIZE, (error) => {
      if (error) {
        // FIXME: Handle error
        console.error("Categories/index.tsx #handleRefresh", error.message)
      }
      this.setState({ refreshingFromPull: false })
    })
  }

  // @TODO: Implement test on this component https://artsyproduct.atlassian.net/browse/LD-563
  render() {
    const rows = extractNodes(this.props.me.followsAndSaves?.genes, (node) => node.gene!).map((gene) => ({
      key: gene.id,
      content: <SavedItemRow square_image href={gene.href!} image={gene.image!} name={gene.name!} />,
    }))

    if (rows.length === 0) {
      return (
        <StickyTabPageScrollView
          refreshControl={<RefreshControl refreshing={this.state.refreshingFromPull} onRefresh={this.handleRefresh} />}
          contentContainerStyle={{ flex: 1 }}
        >
          <ZeroState
            title="You’re not following any categories yet"
            subtitle="Find a few categories to help improve your artwork recommendations."
          />
        </StickyTabPageScrollView>
      )
    }

    return (
      <StickyTabPageFlatList
        style={{ paddingHorizontal: 0 }}
        contentContainerStyle={{ paddingVertical: 15 }}
        data={rows}
        ItemSeparatorComponent={() => <Spacer mb="5" />}
        onEndReached={this.loadMore}
        onEndReachedThreshold={0.2}
        refreshControl={<RefreshControl refreshing={this.state.refreshingFromPull} onRefresh={this.handleRefresh} />}
        ListFooterComponent={
          this.state.fetchingMoreData ? <Spinner style={{ marginTop: 20, marginBottom: 20 }} /> : null
        }
      />
    )
  }
}

const FavoriteCategoriesContainer = createPaginationContainer(
  Categories,
  {
    me: graphql`
      fragment FavoriteCategories_me on Me
      @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
        followsAndSaves {
          genes: genesConnection(first: $count, after: $cursor) @connection(key: "Categories_followed_genes") {
            pageInfo {
              endCursor
              hasNextPage
            }
            edges {
              node {
                gene {
                  id
                  name
                  href
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
  {
    getConnectionFromProps(props) {
      // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
      return props.me && props.me.followsAndSaves.genes
    },
    getVariables(_props, pageInfo, _fragmentVariables) {
      return pageInfo
    },
    query: graphql`
      query FavoriteCategoriesPaginationQuery($count: Int!, $cursor: String) {
        me {
          ...FavoriteCategories_me @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  }
)

export const FavoriteCategoriesQueryRenderer = () => {
  return (
    <QueryRenderer<FavoriteCategoriesQuery>
      environment={defaultEnvironment}
      query={graphql`
        query FavoriteCategoriesQuery {
          me {
            ...FavoriteCategories_me
          }
        }
      `}
      variables={{
        count: 10,
      }}
      render={renderWithLoadProgress(FavoriteCategoriesContainer)}
    />
  )
}
