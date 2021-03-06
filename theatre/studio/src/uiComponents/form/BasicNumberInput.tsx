import {theme} from '@theatre/studio/css'
import {clamp, isInteger, round} from 'lodash-es'
import {darken, lighten} from 'polished'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import DraggableArea from '@theatre/studio/uiComponents/DraggableArea'

type IMode = IState['mode']

const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 0;
  box-sizing: border-box;

  &:after {
    position: absolute;
    inset: 1px 0 2px;
    display: block;
    content: ' ';
    background-color: transparent;
    border: 1px solid transparent;
    z-index: -2;
    box-sizing: border-box;
    border-radius: 1px;
  }

  &:hover,
  &.dragging,
  &.editingViaKeyboard {
    &:after {
      background-color: #10101042;
      border-color: #00000059;
    }
  }
`

const Input = styled.input`
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.9);
  padding: 1px 6px;
  font: inherit;
  outline: none;
  cursor: ew-resize;
  text-align: left;
  width: 100%;
  height: calc(100% - 4px);
  border-radius: 2px;

  /* &:hover,
  &:focus,
  ${Container}.dragging > & {
    background: ${darken(0.9, theme.panel.bg)};
    border: 1px solid ${lighten(0.1, theme.panel.bg)};
  } */

  &:focus {
    cursor: text;
  }
`

const FillIndicator = styled.div`
  position: absolute;
  inset: 3px 2px 4px;
  transform: scale(var(--percentage), 1);
  transform-origin: top left;
  background-color: #2d5561;
  z-index: -1;
  border-radius: 2px;

  ${Container}.dragging &, ${Container}.noFocus:hover & {
    background-color: #338198;
  }
`

function isValueAcceptable(s: string) {
  const v = parseFloat(s)
  return !isNaN(v)
}

type IState_NoFocus = {
  mode: 'noFocus'
}

type IState_EditingViaKeyboard = {
  mode: 'editingViaKeyboard'
  currentEditedValueInString: string
  valueBeforeEditing: number
}

type IState_Dragging = {
  mode: 'dragging'
  valueBeforeDragging: number
  currentDraggingValue: number
}

type IState = IState_NoFocus | IState_EditingViaKeyboard | IState_Dragging

const BasicNumberInput: React.FC<{
  value: number
  temporarilySetValue: (v: number) => void
  discardTemporaryValue: () => void
  permenantlySetValue: (v: number) => void
  className?: string
  range?: [min: number, max: number]
}> = (propsA) => {
  const [stateA, setState] = useState<IState>({mode: 'noFocus'})

  const refs = useRef({state: stateA, props: propsA})
  refs.current = {state: stateA, props: propsA}

  const inputRef = useRef<HTMLInputElement | null>(null)
  const bodyCursorBeforeDrag = useRef<string | null>(null)

  const callbacks = useMemo(() => {
    const inputChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = refs.current.state as IState_EditingViaKeyboard

      setState({...curState, currentEditedValueInString: value})

      if (!isValueAcceptable(value)) return

      const valInFloat = parseFloat(value)
      refs.current.props.temporarilySetValue(valInFloat)
    }

    const onBlur = () => {
      if (refs.current.state.mode === 'editingViaKeyboard') {
        commitKeyboardInput()
        setState({mode: 'noFocus'})
      } else {
      }
    }

    const commitKeyboardInput = () => {
      const curState = refs.current.state as IState_EditingViaKeyboard
      if (!isValueAcceptable(curState.currentEditedValueInString)) {
        refs.current.props.discardTemporaryValue()
      } else {
        const value = parseFloat(curState.currentEditedValueInString)
        if (curState.valueBeforeEditing === value) {
          refs.current.props.discardTemporaryValue()
        } else {
          refs.current.props.permenantlySetValue(value)
        }
      }
    }

    const onInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        refs.current.props.discardTemporaryValue()
        inputRef.current!.blur()
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        commitKeyboardInput()
        inputRef.current!.blur()
      }
    }

    const onClick = (e: React.MouseEvent) => {
      if (refs.current.state.mode === 'noFocus') {
        const c = inputRef.current!
        c.focus()
        e.preventDefault()
        e.stopPropagation()
      } else {
        e.stopPropagation()
      }
    }

    const onFocus = () => {
      if (refs.current.state.mode === 'noFocus') {
        transitionToEditingViaKeyboardMode()
      } else if (refs.current.state.mode === 'editingViaKeyboard') {
      }
    }

    const transitionToEditingViaKeyboardMode = () => {
      const curValue = refs.current.props.value
      setState({
        mode: 'editingViaKeyboard',
        currentEditedValueInString: String(curValue),
        valueBeforeEditing: curValue,
      })

      setTimeout(() => {
        inputRef.current!.focus()
        inputRef.current!.setSelectionRange(0, 100)
      })
    }

    const transitionToDraggingMode = () => {
      const curValue = refs.current.props.value

      setState({
        mode: 'dragging',
        valueBeforeDragging: curValue,
        currentDraggingValue: curValue,
      })

      bodyCursorBeforeDrag.current = document.body.style.cursor
    }

    const onDragEnd = (happened: boolean) => {
      if (!happened) {
        refs.current.props.discardTemporaryValue()
        setState({mode: 'noFocus'})

        inputRef.current!.focus()
        inputRef.current!.setSelectionRange(0, 100)
      } else {
        const curState = refs.current.state as IState_Dragging
        const value = curState.currentDraggingValue
        if (curState.valueBeforeDragging === value) {
          refs.current.props.discardTemporaryValue()
        } else {
          refs.current.props.permenantlySetValue(value)
        }
        setState({mode: 'noFocus'})
      }
    }

    const onDrag = (dx: number, _dy: number) => {
      const curState = refs.current.state as IState_Dragging
      const newValue = curState.valueBeforeDragging + dx

      setState({
        ...curState,
        currentDraggingValue: newValue,
      })

      refs.current.props.temporarilySetValue(newValue)
    }

    return {
      inputChange,
      onBlur,
      transitionToDraggingMode,
      onInputKeyDown,
      onClick,
      onFocus,
      onDragEnd,
      onDrag,
    }
  }, [refs, setState, inputRef])

  let value =
    stateA.mode !== 'editingViaKeyboard'
      ? format(propsA.value)
      : stateA.currentEditedValueInString

  if (typeof value === 'number' && isNaN(value)) {
    value = 'NaN'
  }

  const theInput = (
    <Input
      key="input"
      type="text"
      onChange={callbacks.inputChange}
      value={value}
      onBlur={callbacks.onBlur}
      onKeyDown={callbacks.onInputKeyDown}
      onClick={callbacks.onClick}
      onFocus={callbacks.onFocus}
      ref={inputRef}
      onMouseDown={(e: React.MouseEvent) => {
        e.stopPropagation()
      }}
      onDoubleClick={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    />
  )

  const {range} = propsA
  const num = parseFloat(value)

  const fillIndicator = range ? (
    <FillIndicator
      style={{
        // @ts-ignore
        '--percentage': clamp((num - range[0]) / (range[1] - range[0]), 0, 1),
      }}
    />
  ) : null

  return (
    <Container className={propsA.className + ' ' + refs.current.state.mode}>
      <DraggableArea
        key="draggableArea"
        onDragStart={callbacks.transitionToDraggingMode}
        onDragEnd={callbacks.onDragEnd}
        onDrag={callbacks.onDrag}
        enabled={refs.current.state.mode !== 'editingViaKeyboard'}
        lockCursorTo="ew-resize"
      >
        {theInput}
      </DraggableArea>
      {fillIndicator}
    </Container>
  )
}

function format(v: number): string {
  return isNaN(v) ? 'NaN' : isInteger(v) ? v.toFixed(0) : round(v, 3).toString()
}

export default BasicNumberInput
