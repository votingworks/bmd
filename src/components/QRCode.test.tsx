import React from 'react'
import { render } from '@testing-library/react'

import QRCode from './QRCode'

describe('renders QR Code with size', () => {
  it('renders basic QR Code', async () => {
    const { container } = render(
      <QRCode size="1in" value="http://voting.works" />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
  it('renders QR Code', async () => {
    const { container } = render(<QRCode value="VX.21.5" />)
    expect(container.firstChild).toMatchSnapshot()
    expect(container.querySelector('path[fill="#000000"]')!)
      .toMatchInlineSnapshot(`
      <path
        d="M0 0h7v1H0zM8 0h3v1H8zM12 0h1v1H12zM14,0 h7v1H14zM0 1h1v1H0zM6 1h1v1H6zM10 1h1v1H10zM12 1h1v1H12zM14 1h1v1H14zM20,1 h1v1H20zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h1v1H8zM11 2h1v1H11zM14 2h1v1H14zM16 2h3v1H16zM20,2 h1v1H20zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM9 3h4v1H9zM14 3h1v1H14zM16 3h3v1H16zM20,3 h1v1H20zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h1v1H8zM12 4h1v1H12zM14 4h1v1H14zM16 4h3v1H16zM20,4 h1v1H20zM0 5h1v1H0zM6 5h1v1H6zM9 5h1v1H9zM11 5h2v1H11zM14 5h1v1H14zM20,5 h1v1H20zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14,6 h7v1H14zM8 7h1v1H8zM12 7h1v1H12zM5 8h2v1H5zM9 8h2v1H9zM14 8h1v1H14zM16 8h1v1H16zM18 8h1v1H18zM20,8 h1v1H20zM2 9h1v1H2zM8 9h3v1H8zM12 9h2v1H12zM16 9h1v1H16zM19,9 h2v1H19zM2 10h5v1H2zM9 10h2v1H9zM13 10h1v1H13zM15 10h1v1H15zM18 10h2v1H18zM3 11h1v1H3zM5 11h1v1H5zM8 11h1v1H8zM10 11h1v1H10zM12 11h4v1H12zM18 11h1v1H18zM20,11 h1v1H20zM0 12h2v1H0zM3 12h1v1H3zM5 12h3v1H5zM9 12h1v1H9zM11 12h1v1H11zM13 12h2v1H13zM16 12h2v1H16zM20,12 h1v1H20zM8 13h3v1H8zM13 13h5v1H13zM19 13h1v1H19zM0 14h7v1H0zM10 14h2v1H10zM14 14h2v1H14zM19 14h1v1H19zM0 15h1v1H0zM6 15h1v1H6zM8 15h1v1H8zM11 15h1v1H11zM14 15h1v1H14zM18 15h2v1H18zM0 16h1v1H0zM2 16h3v1H2zM6 16h1v1H6zM9 16h5v1H9zM16 16h2v1H16zM19 16h1v1H19zM0 17h1v1H0zM2 17h3v1H2zM6 17h1v1H6zM9 17h3v1H9zM13 17h2v1H13zM16 17h1v1H16zM18 17h1v1H18zM0 18h1v1H0zM2 18h3v1H2zM6 18h1v1H6zM9 18h2v1H9zM12 18h1v1H12zM15 18h3v1H15zM19,18 h2v1H19zM0 19h1v1H0zM6 19h1v1H6zM9 19h1v1H9zM11 19h1v1H11zM15 19h1v1H15zM18 19h1v1H18zM0 20h7v1H0zM13 20h1v1H13zM15 20h1v1H15zM17 20h1v1H17zM19 20h1v1H19z"
        fill="#000000"
      />
    `)
  })
})
