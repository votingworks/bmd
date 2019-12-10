import QRCodeReact from '@votingworks/qrcode.react'
import React from 'react'
import styled from 'styled-components'

interface SVGProps {
  size?: string
}
interface Props extends SVGProps {
  value: string | Uint8Array
}

const ResponsiveSvgWrapper = styled('span')<SVGProps>`
  & > svg {
    display: block; /* svg is "inline" by default */
    width: ${({ size = '100%' }) => size}; /* reset width */
    height: auto; /* reset height */
  }
`

const QRCode = ({ size, value }: Props) => (
  <ResponsiveSvgWrapper size={size}>
    <QRCodeReact renderAs="svg" value={value} level="H" />
  </ResponsiveSvgWrapper>
)

export default QRCode
