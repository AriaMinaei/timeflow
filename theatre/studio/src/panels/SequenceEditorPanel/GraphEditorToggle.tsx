import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import {useVal} from '@theatre/dataverse-react'
import getStudio from '@theatre/studio/getStudio'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'

const Container = styled.button`
  outline: none;
  background-color: #1c1d21;
  border: 1px solid #191919;
  border-radius: 2px;
  display: flex;
  bottom: 14px;
  right: 8px;
  z-index: 1;
  position: absolute;

  padding: 0 8px;
  display: flex;
  color: #656d77;
  line-height: 20px;
  font-size: 10px;

  &:hover {
    color: white;
  }
`

const GraphEditorToggle: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const isOpen = useVal(layoutP.graphEditorDims.isOpen)
  const toggle = useCallback(() => {
    const sheet = val(layoutP.sheet)
    const isOpen = val(layoutP.graphEditorDims.isOpen)
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.sequenceEditor.graphEditor.setIsOpen({
        isOpen: !isOpen,
      })
    })
  }, [layoutP])
  return <Container onClick={toggle}>Graph Editor</Container>
}

export default GraphEditorToggle
