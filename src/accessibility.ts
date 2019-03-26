/*
 * In all of this code that navigates the DOM, we do this a lot:
 *
 * document.activeElement!
 *
 * Note the non-null typescript assertion.
 *
 * That is because, while typescript doesn't know there is always an activeElement, there actually always is.
 * Adding a conditional would make it impossible to get to 100% test coverage, because we can never simulate that impossible situation.
 */

// because javascript has no true modulo
function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function get_focusable_elements() {
  return Array.from(
    document.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
  )
}

function do_ArrowUp() {
  const focusable = get_focusable_elements()
  const currentIndex = focusable.indexOf(document.activeElement!)

  if (currentIndex > -1) {
    ;(focusable[mod(currentIndex - 1, focusable.length)] as HTMLElement).focus()
  } else {
    ;(focusable[focusable.length - 1] as HTMLElement).focus()
  }
}

function do_ArrowDown() {
  const focusable = get_focusable_elements()
  const currentIndex = focusable.indexOf(document.activeElement!)
  ;(focusable[mod(currentIndex + 1, focusable.length)] as HTMLElement).focus()
}

function do_ArrowLeft() {
  const previousButton: HTMLButtonElement = document.getElementById(
    'previous'
  ) as HTMLButtonElement
  if (previousButton) {
    previousButton.click()
  }
}

function do_ArrowRight() {
  const nextButton: HTMLButtonElement = document.getElementById(
    'next'
  ) as HTMLButtonElement
  if (nextButton) {
    nextButton.click()
  }
}

function do_Select() {
  ;(document.activeElement! as HTMLElement).click()
}

export function gamepadButtonDown(buttonName: string) {
  switch (buttonName) {
    case 'DPadUp':
      do_ArrowUp()
      break
    case 'A':
    case 'DPadDown':
      do_ArrowDown()
      break
    case 'DPadLeft':
      do_ArrowLeft()
      break
    case 'DPadRight':
      do_ArrowRight()
      break
    case 'B':
      do_Select()
      break
  }
}

export function registerEventListeners() {
  /* istanbul ignore next */
  // Capture special events to mimick the XAC
  document.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowUp':
        do_ArrowUp()
        break
      case '[':
      case 'ArrowDown':
        do_ArrowDown()
        break
      case 'ArrowLeft':
        do_ArrowLeft()
        break
      case 'ArrowRight':
        do_ArrowRight()
        break
      case ']':
        do_Select()
        break
    }
  })
}
