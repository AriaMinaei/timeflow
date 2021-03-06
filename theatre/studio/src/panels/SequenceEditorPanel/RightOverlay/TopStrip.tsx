import {useVal} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import StampsGrid from '@theatre/studio/panels/SequenceEditorPanel/FrameGrid/StampsGrid'

const height = 20

export const topStripTheme = {
  backgroundColor: `#1f2120eb`,
  borderColor: `#1c1e21`,
}

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${height}px;
  box-sizing: border-box;
  background: ${topStripTheme.backgroundColor};
  border-bottom: 1px solid ${topStripTheme.borderColor};
`

const TopStrip: React.FC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const width = useVal(layoutP.rightDims.width)
  return (
    <Container>
      <StampsGrid layoutP={layoutP} width={width} height={height} />
    </Container>
  )
}

export default TopStrip
