export type CommsSignal = 'standby' | 'receiving' | 'transmitting'

// Shared between the comms panel (draws the waveform) and the composer (what the visitor is doing).
export function useCommsSignal() {
  return useState<CommsSignal>('comms-signal', () => 'standby')
}
