import * as React from 'react'
import styled from 'styled-components'
import QRCodeImpl from 'qr.js/lib/QRCode'
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel'
import mode from 'qr.js/lib/mode'
import BitBuffer from 'qr.js/lib/BitBuffer'
import QRCode from 'qrcode.react'
import { encodeVotes } from '../encodeVotes'
import { Election } from '../config/types'
import sample from '../data/electionSample.json'

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
  padding: 15px;
`

const QRCodeImage = styled.div`
  width: 150px;
`

const QRCodeValue = styled.div`
  width: calc(40% - 75px);
  padding-left: 10px;
`

const QRCodeBytes = styled.div`
  width: calc(60% - 75px);
  font-family: 'Fira Code', 'Menlo', 'Monaco', monospace;
`

const BytesPerRow = 16

/* eslint-disable no-null/no-null */
function generatePath(modules: number[][], margin = 0): string {
  const ops: string[] = []
  modules.forEach(function(row, y) {
    let start: number | null = null
    row.forEach(function(cell, x) {
      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        ops.push(
          `M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`
        )
        start = null
        return
      }

      // end of row, clean up or skip
      if (x === row.length - 1) {
        if (!cell) {
          // We would have closed the op above already so this can only mean
          // 2+ light modules in a row.
          return
        }

        if (start === null) {
          // Just a single dark module.
          ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`)
        } else {
          // Otherwise finish the current line.
          ops.push(
            `M${start + margin},${y + margin} h${x + 1 - start}v1H${start +
              margin}z`
          )
        }

        return
      }

      if (cell && start === null) {
        start = x
      }
    })
  })
  return ops.join('')
}

const MARGIN_SIZE = 4

function MyQRCode({
  value,
  size,
  level = 'H',
  bgColor = '#fff',
  fgColor = '#000',
  includeMargin,
}: {
  value: Uint8Array
  size?: number
  level?: 'M' | 'L' | 'H' | 'Q'
  bgColor?: string
  fgColor?: string
  includeMargin?: boolean
}) {
  const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level])
  // qrcode.addData(value);

  qrcode.dataList.push({
    mode: mode.MODE_8BIT_BYTE,

    getLength(): number {
      return value.length
    },

    write(buffer: BitBuffer): void {
      for (let i = 0; i < value.length; i++) {
        buffer.put(value[i], 8)
      }
    },
  })
  qrcode.dataCache = null

  qrcode.make()
  const cells = qrcode.modules

  console.log(cells)
  if (cells === null) {
    return null
  }

  const margin = includeMargin ? MARGIN_SIZE : 0 // Drawing strategy: instead of a rect per module, we're going to create a
  // single path for the dark modules and layer that on top of a light rect,
  // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
  // way faster than DOM ops.
  // For level 1, 441 nodes -> 2
  // For level 40, 31329 -> 2

  const fgPath = generatePath(cells, margin)
  const numCells = cells.length + margin * 2
  return (
    <svg
      shapeRendering="crispEdges"
      height={size}
      width={size}
      viewBox={`0 0 ${numCells} ${numCells}`}
    >
      <path fill={bgColor} d={`M0,0 h${numCells}v${numCells}H0z`} />
      <path fill={fgColor} d={fgPath} />
    </svg>
  )
}
/* eslint-enable no-null/no-null */

function QRCodeExample({ value }: { value: Uint8Array }) {
  return (
    <QRCodeContainer>
      <QRCodeImage>
        <MyQRCode value={value} />
      </QRCodeImage>
      <QRCodeValue>{value}</QRCodeValue>
      <QRCodeBytes>
        {Array.from(value)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .reduce<string[][]>(
            (lists, byte) => {
              const lastList = lists[lists.length - 1]

              if (lastList.length === BytesPerRow) {
                lists.push([byte])
              } else {
                lastList.push(byte)
              }

              return lists
            },
            [[]]
          )
          .reduce<React.ReactChild[]>(
            (elements, list) => [
              ...elements,
              list.join(' '),
              <br key={list.join(' ')} />,
            ],
            []
          )}
      </QRCodeBytes>
    </QRCodeContainer>
  )
}

function utf8Encode(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

export default function QRCodeTestPage() {
  const election = sample as Election

  return (
    <>
      {/* <QRCode value="abcdefghijklmnopqrstuvwxyz" renderAs="svg" /> */}
      <QRCodeExample value={utf8Encode('abcdefghijklmnopqrstuvwxyz')} />
      <QRCodeExample value={utf8Encode('😊')} />
      <QRCodeExample
        value={encodeVotes(election.contests, { 'measure-666': 'yes' })}
      />
      <QRCodeExample
        value={encodeVotes(election.contests, {
          'county-registrar-of-wills': [
            {
              id: 'write-in__MICKEY MOUSE',
              name: 'MICKEY MOUSE',
              isWriteIn: true,
            },
          ],
        })}
      />
    </>
  )
}
