import { StackScreenProps } from "@react-navigation/stack"
import { FilterData, ParamDefaultValues } from "lib/utils/ArtworkFilter/ArtworkFiltersStore"
import { FilterDisplayName, FilterParamName } from "lib/utils/ArtworkFilter/FilterArtworksHelpers"
import { useArtworkFiltersAggregation } from "lib/utils/ArtworkFilter/useArtworkFilters"
import React, { useState } from "react"
import { FilterModalNavigationStack } from "../FilterModal"
import { MultiSelectOptionScreen } from "./MultiSelectOption"

const DEFAULT_OPTION: FilterData = {
  displayText: "All",
  paramValue: ParamDefaultValues.geneIDs,
  paramName: FilterParamName.geneIDs,
}

interface GeneIDsOptionsScreenProps extends StackScreenProps<FilterModalNavigationStack, "GeneIDsOptionsScreen"> {}

export const GeneIDsOptionsScreen: React.FC<GeneIDsOptionsScreenProps> = ({ navigation }) => {
  // Uses the medium aggregations
  const { aggregation } = useArtworkFiltersAggregation({ paramName: FilterParamName.medium })

  // But updates the geneIDs option
  const { dispatch, selectedOption } = useArtworkFiltersAggregation({ paramName: FilterParamName.geneIDs })

  const [nextOptions, setNextOptions] = useState<string[]>((selectedOption?.paramValue as string[]) ?? [])

  const filterOptions: FilterData[] = [
    DEFAULT_OPTION,
    ...(aggregation?.counts ?? []).map(({ name: displayText, value: paramValue, count }) => {
      return {
        paramName: FilterParamName.geneIDs,
        displayText,
        paramValue,
        count,
      }
    }),
  ]

  const booleanFilterOptions: FilterData[] = filterOptions.map((option) => {
    if (option.displayText === DEFAULT_OPTION.displayText) {
      return { ...option, paramValue: nextOptions.length === 0 }
    }

    return { ...option, paramValue: nextOptions.includes(option.paramValue as string) }
  })

  const handleSelect = (option: FilterData, updatedValue: boolean) => {
    if (updatedValue) {
      setNextOptions((prev) => {
        let next = []

        // If the `All` toggle is selected; reset the filters to the default value (`[]`)
        if (option.displayText === DEFAULT_OPTION.displayText) {
          next = ParamDefaultValues.geneIDs
        } else {
          // Otherwise append it
          next = [
            ...prev,
            (aggregation?.counts ?? []).find(({ name }) => {
              return name === option.displayText
            })?.value as string,
          ]
        }

        dispatch({
          type: "selectFilters",
          payload: {
            displayText: option.displayText,
            paramValue: next,
            paramName: option.paramName,
          },
        })

        return next
      })
    } else {
      setNextOptions((prev) => {
        let next = prev.filter((value) => {
          return (
            value !==
            ((aggregation?.counts ?? []).find(({ name }) => {
              return name === option.displayText
            })?.value as string)
          )
        })

        // If nothing is selected toggle the default value (`[]`)
        if (next.length === 0) {
          next = ParamDefaultValues.geneIDs
        }

        dispatch({
          type: "selectFilters",
          payload: {
            displayText: option.displayText,
            paramValue: next,
            paramName: option.paramName,
          },
        })

        return next
      })
    }
  }

  return (
    <MultiSelectOptionScreen
      onSelect={handleSelect}
      filterHeaderText={FilterDisplayName.geneIDs}
      filterOptions={booleanFilterOptions}
      navigation={navigation}
    />
  )
}
