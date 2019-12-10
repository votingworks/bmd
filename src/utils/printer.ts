export interface Printer {
  print(deviceName?: string, paperSource?: string): Promise<void>
}

export class LocalPrinter implements Printer {
  public async print(): Promise<void> {
    window.print()
  }
}

export class NullPrinter implements Printer {
  public async print(): Promise<void> {
    // do nothing
  }
}

export default function getPrinter(): Printer {
  return window.kiosk ?? new LocalPrinter()
}
