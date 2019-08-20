declare module 'react-gamepad' {
  export type ButtonName =
    | 'A'
    | 'B'
    | 'X'
    | 'Y'
    | 'Start'
    | 'Back'
    | 'LT'
    | 'RT'
    | 'LB'
    | 'RB'
    | 'LS'
    | 'RS'
    | 'DPadUp'
    | 'DPadDown'
    | 'DPadLeft'
    | 'DPadRight'

  export type AxisName =
    | 'LeftStickX'
    | 'LeftStickY'
    | 'RightStickX'
    | 'RightStickY'
    | 'LeftTrigger'
    | 'RightTrigger'

  export interface Props {
    /**
     * The index of the gamepad to use, from 0 to 4 Default: 0
     */
    gamepadIndex?: number

    /**
     * Threshold above which onUp, onDown,onLeft,onRight are Triggered for the left stick Default: 0.75
     */
    stickThreshold?: number

    /**
     * Threshold below which the axis values will be rounded to 0.0 Default: 0.08
     */
    deadZone?: number

    /**
     * Layout to use, from Gamepad.layouts. For now, only Gamepad.layouts.XBOX exists Default: Gamepad.layouts.XBOX
     */
    layout?: Layout

    /**
     * triggered when the gamepad connects. Will be Triggered at least once after the Gamepad component is mounted.
     */
    onConnect?(gamepadIndex: number): void

    /**
     * triggered when the gamepad disconnects.
     */
    onDisconnect?(gamepadIndex: number): void

    /**
     * triggered when a button is pushed.
     */
    onButtonDown?(buttonName: ButtonName): void

    /**
     * triggered when a button is released.
     */
    onButtonUp?(buttonName: ButtonName): void

    /**
     * triggered when a button is pushed or released.
     */
    onButtonChange?(buttonName: ButtonName, pressed: bool): void

    /**
     * triggered when an axis is changed.
     */
    onAxisChange?(
      axisName: AxisName,
      value: number,
      previousValue: number
    ): void

    /**
     * triggered when the A button is pressed.
     */
    onA?(): void

    /**
     * triggered when the B button is pressed.
     */
    onB?(): void

    /**
     * triggered when the X button is pressed.
     */
    onX?(): void

    /**
     * Triggered when the Y button is pressed.
     */
    onY?(): void

    /**
     * Triggered when the LT button is pressed.
     */
    onLT?(): void

    /**
     * Triggered when the RT button is pressed.
     */
    onRT?(): void

    /**
     * Triggered when the LB button is pressed.
     */
    onLB?(): void

    /**
     * Triggered when the RB button is pressed.
     */
    onRB?(): void

    /**
     * Triggered when the LS button is pressed.
     */
    onLS?(): void

    /**
     * Triggered when the RS button is pressed.
     */
    onRS?(): void

    /**
     * Triggered when the D Pad Up button is pressed or the Left Stick is pushed up (above stickThreshold).
     */
    onUp?(): void

    /**
     * Triggered when the D Pad Down button is pressed or the Left Stick is pushed down (above stickThreshold).
     */
    onDown?(): void

    /**
     * Triggered when the D Pad Left button is pressed or the Left Stick is pushed left (above stickThreshold).
     */
    onLeft?(): void

    /**
     * Triggered when the D Pad Right button is pressed or the Left Stick is pushed right (above stickThreshold).
     */
    onRight?(): void
  }

  declare const Gamepad: React.ComponentClass<Props>
  export default Gamepad
}
