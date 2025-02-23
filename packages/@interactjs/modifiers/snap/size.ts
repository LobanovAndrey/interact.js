// This module allows snapping of the size of targets during resize
// interactions.

import extend from '@interactjs/utils/extend'
import is from '@interactjs/utils/is'

import { makeModifier } from '../base'
import type { ModifierArg } from '../types'

import type { SnapOptions, SnapState } from './pointer'
import { snap } from './pointer'

export type SnapSizeOptions = Pick<SnapOptions, 'targets' | 'offset' | 'endOnly' | 'range' | 'enabled'>

function start (arg: ModifierArg<SnapState>) {
  const { state, edges } = arg
  const { options } = state

  if (!edges) {
    return null
  }

  arg.state = {
    options: {
      targets: null,
      relativePoints: [
        {
          x: edges.left ? 0 : 1,
          y: edges.top ? 0 : 1,
        },
      ],
      offset: options.offset || 'self',
      origin: { x: 0, y: 0 },
      range: options.range,
    },
  }

  state.targetFields = state.targetFields || [
    ['width', 'height'],
    ['x', 'y'],
  ]

  snap.start(arg)
  state.offsets = arg.state.offsets

  arg.state = state
}

function set (arg) {
  const { interaction, state, coords } = arg
  const { options, offsets } = state
  const relative = {
    x: coords.x - offsets[0].x,
    y: coords.y - offsets[0].y,
  }

  state.options = extend({}, options)
  state.options.targets = []

  for (const snapTarget of options.targets || []) {
    let target

    if (is.func(snapTarget)) {
      target = snapTarget(relative.x, relative.y, interaction)
    } else {
      target = snapTarget
    }

    if (!target) {
      continue
    }

    for (const [xField, yField] of state.targetFields) {
      if (xField in target || yField in target) {
        target.x = target[xField]
        target.y = target[yField]

        break
      }
    }

    state.options.targets.push(target)
  }

  const returnValue = snap.set(arg)

  state.options = options

  return returnValue
}

const defaults: SnapSizeOptions = {
  range: Infinity,
  targets: null,
  offset: null,
  endOnly: false,
  enabled: false,
}

const snapSize = {
  start,
  set,
  defaults,
}

export default makeModifier(snapSize, 'snapSize')
export { snapSize }
