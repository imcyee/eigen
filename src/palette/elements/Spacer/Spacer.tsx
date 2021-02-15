import { SpaceProps } from "palette/helpers"
import React from "react"
import { HeightProps, WidthProps } from "styled-system"
import { Box } from "../../elements/Box"

export interface SpacerProps extends SpaceProps, WidthProps, HeightProps {}

/**
 * A component used to inject space where it's needed
 */
export const Spacer: React.FC<SpacerProps & { id?: string }> = (props) => {
  return <Box {...props} />
}

Spacer.displayName = "Spacer"
